package safety

import (
	"context"
	"fmt"
	"jasper/safety/providers"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
)

var (
	urlRegex = regexp.MustCompile(`(?i)https?://[^\s]+`)
	channelCooldown = map[string]time.Time{}
	bucket          int
	lastBucketReset time.Time
)

func canScan(cfg *BotConfig, channelID string) bool {
	if cooldown, ok := channelCooldown[channelID]; ok {
		if time.Since(cooldown) < time.Duration(cfg.RateLimit.PerChannelCooldownSec)*time.Second {
			return false
		}
	}
	channelCooldown[channelID] = time.Now()
	return true
}

func takeToken(cfg *BotConfig) bool {
	if time.Since(lastBucketReset) > time.Minute {
		bucket = cfg.RateLimit.MaxCallsPerMinute
		lastBucketReset = time.Now()
	}
	if bucket <= 0 {
		return false
	}
	bucket--
	return true
}

func extractLinks(text string) []string {
	matches := urlRegex.FindAllString(text, -1)
	set := map[string]struct{}{}
	for _, l := range matches {
		set[l] = struct{}{}
	}
	out := make([]string, 0, len(set))
	for l := range set {
		out = append(out, l)
	}
	sort.Strings(out)
	return out
}

type Decision struct {
	IsScam     bool
	Confidence float64
	Reasons    []string
	Tags       []string
	HardBlock  bool
}

func ProcessMessage(ctx context.Context, cfg *BotConfig, s *discordgo.Session, m *discordgo.Message) {
	if m.Author.Bot || m.GuildID == "" {
		return
	}

    // Whitelist channels / categories (comma-separated IDs in env vars)
    if isWhitelisted(m.ChannelID) {
        return
    }
    // If category whitelist provided, fetch channel to check parent
    if catIDs := whitelistCategories(); len(catIDs) > 0 {
        ch, _ := s.State.Channel(m.ChannelID)
        if ch == nil {
            ch, _ = s.Channel(m.ChannelID)
        }
        if ch != nil && contains(catIDs, ch.ParentID) {
            return
        }
    }

	content := strings.TrimSpace(m.Content)
	if content == "" {
		return
	}

	authorAgeDays := UserAgeDays(m.Author)
	links := extractLinks(content)

	hardBlocked := matchAny(cfg.HardBlockRegexes, content)
	triggered := hardBlocked || matchAny(cfg.TriggerPatterns, content)
	if !triggered {
		return
	}
	if !canScan(cfg, m.ChannelID) {
		return
	}
	if !takeToken(cfg) {
		return
	}

	examplesJSON := loadExamples(cfg)
	examples := make([]LabeledExample, len(examplesJSON))
	for i, ex := range examplesJSON {
		examples[i] = LabeledExample{Content: ex.Content, Label: ex.Label, Reason: ex.Reason, Meta: struct{ AuthorAgeDays int }{ex.Meta.AuthorAgeDays}}
	}

	systemPrompt := buildSystemPrompt(examples)
	userPrompt := buildUserPrompt(content, authorAgeDays, links)

	cli := providers.ByName(string(cfg.Provider))
	var resp providers.Response
	var err error
	if cli != nil {
		resp, err = cli.Classify(string(cfg.Model), systemPrompt, userPrompt)
		if err != nil {
			logger.Warnf("classification error: %v", err)
		}
	}

	dec := Decision{HardBlock: hardBlocked}
	if resp.JSON != nil {
		if v, ok := resp.JSON["is_scam"].(bool); ok {
			dec.IsScam = v
		}
		if v, ok := resp.JSON["confidence"].(float64); ok {
			dec.Confidence = v
		}
		if arr, ok := resp.JSON["reasons"].([]interface{}); ok {
			for _, a := range arr {
				if s, ok := a.(string); ok {
					dec.Reasons = append(dec.Reasons, s)
				}
			}
		}
		if arr, ok := resp.JSON["tags"].([]interface{}); ok {
			for _, a := range arr {
				if s, ok := a.(string); ok {
					dec.Tags = append(dec.Tags, s)
				}
			}
		}
	} else {
		// Fallback heuristic when JSON missing
		scamHeur := hardBlocked || (len(links) > 0 && regexp.MustCompile(`(?i)nitro|airdrop|wallet|seed`).MatchString(content))
		dec.IsScam = scamHeur
		dec.Reasons = []string{"Heuristic fallback"}
		dec.Tags = []string{"fallback"}
		if dec.IsScam {
			dec.Confidence = 0.7
		} else {
			dec.Confidence = 0.3
		}
	}

	if hardBlocked && cfg.Moderation.DeleteIfHardBlockRegex {
		dec.IsScam = true
		dec.Confidence = 0.99
		dec.Reasons = []string{"Matched hard-block pattern"}
		dec.Tags = append(dec.Tags, "hard_block")
	}

	handleDecision(cfg, s, m, dec)

	// Debug trace
	go sendDebugTrace(s, m, struct{ Triggered, HardBlocked bool; D Decision; RawLLM, System, User string }{triggered, hardBlocked, dec, resp.Raw, systemPrompt, userPrompt})
}

func matchAny(regexes []string, text string) bool {
	for _, pat := range regexes {
		re, err := regexp.Compile(pat)
		if err != nil {
			continue
		}
		if re.MatchString(text) {
			return true
		}
	}
	return false
}

func handleDecision(cfg *BotConfig, s *discordgo.Session, m *discordgo.Message, d Decision) {
	if d.IsScam && cfg.Moderation.Actions.DeleteMessage && (d.HardBlock || d.Confidence >= cfg.Moderation.MinConfidenceToDelete) && cfg.ProductionReady {
		_ = s.ChannelMessageDelete(m.ChannelID, m.ID)
		if cfg.Moderation.Actions.DmUserOnDelete {
			dm, _ := s.UserChannelCreate(m.Author.ID)
			_, _ = s.ChannelMessageSend(dm.ID, "Your message was removed for suspected scam content. Contact the moderators if this is a mistake.")
		}
	}
	// TODO: implement mod alert embeds/buttons similar to TS

	shouldFlag := cfg.Moderation.Actions.PostModAlert && d.IsScam && d.Confidence >= cfg.Moderation.MinConfidenceToFlag
	modChanId := os.Getenv("MOD_CHANNEL_ID")
	if shouldFlag && modChanId != "" {
		ch, err := s.Channel(modChanId)
		if err != nil || ch.Type != discordgo.ChannelTypeGuildText {
			logger.Warnf("invalid mod channel %s: %v", modChanId, err)
			return
		}

		embed := &discordgo.MessageEmbed{
			Title:       "Possible Scam",
			Description: truncate(m.Content, 1000),
			Color:       0xE74C3C,
			Fields: []*discordgo.MessageEmbedField{
				{Name: "User", Value: fmt.Sprintf("<@%s> (~%d days old)", m.Author.ID, UserAgeDays(m.Author)), Inline: false},
				{Name: "Channel", Value: fmt.Sprintf("<#%s>", m.ChannelID), Inline: true},
				{Name: "Confidence", Value: fmt.Sprintf("%.2f", d.Confidence), Inline: true},
				{Name: "Reasons", Value: strings.Join(d.Reasons, " • "), Inline: false},
				{Name: "Tags", Value: strings.Join(d.Tags, ", "), Inline: true},
			},
			Footer:    &discordgo.MessageEmbedFooter{Text: fmt.Sprintf("productionReady=%v", cfg.ProductionReady)},
			Timestamp: time.Now().Format(time.RFC3339),
		}

		_, err = s.ChannelMessageSendComplex(modChanId, &discordgo.MessageSend{
			Embeds:     []*discordgo.MessageEmbed{embed},
			Components: createInitialComponents(cfg, m),
		})
		if err != nil {
			logger.Warnf("failed to send mod alert: %v", err)
		}
	}

	_ = AdoptExample(AdoptionInput{
		Content:    m.Content,
		Predicted:  chooseLabelBool(d.IsScam),
		Confidence: d.Confidence,
		Meta: struct {
			Channel       string "json:\"channel,omitempty\""
			AuthorAgeDays int    "json:\"authorAgeDays,omitempty\""
		}{m.ChannelID, UserAgeDays(m.Author)},
		Reason: firstOrEmpty(d.Reasons),
	})
}

func createInitialComponents(cfg *BotConfig, m *discordgo.Message) []discordgo.MessageComponent {
	if !cfg.ProductionReady {
		return []discordgo.MessageComponent{}
	}
	return []discordgo.MessageComponent{
		&discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.Button{
					Label: "Delete", Style: discordgo.DangerButton, CustomID: "scam_del:" + m.ChannelID + ":" + m.ID,
				},
				discordgo.Button{
					Label: "Correct", Style: discordgo.SuccessButton, CustomID: "scam_correct:" + m.ChannelID + ":" + m.ID,
				},
				discordgo.Button{
					Label: "Incorrect", Style: discordgo.SecondaryButton, CustomID: "scam_incorrect:" + m.ChannelID + ":" + m.ID,
				},
			},
		},
	}
}

func chooseLabelBool(b bool) string {
	if b {
		return "scam"
	}
	return "not_scam"
}

func firstOrEmpty(arr []string) string {
	if len(arr) > 0 {
		return arr[0]
	}
	return ""
}

// ---- Whitelist helpers ----
func whitelistChannels() []string {
    return splitIDs(os.Getenv("WHITELIST_CHANNELS"))
}

func whitelistCategories() []string {
    return splitIDs(os.Getenv("WHITELIST_CATEGORIES"))
}

func splitIDs(s string) []string {
    if s == "" {
        return nil
    }
    parts := strings.Split(s, ",")
    for i, p := range parts {
        parts[i] = strings.TrimSpace(p)
    }
    return parts
}

func contains(list []string, id string) bool {
    for _, v := range list {
        if v == id {
            return true
        }
    }
    return false
}

func isWhitelisted(channelID string) bool {
    return contains(whitelistChannels(), channelID)
}

func truncate(s string, n int) string {
    if len([]rune(s)) <= n {
        return s
    }
    r := []rune(s)
    return string(r[:n]) + "…"
}

// ---- Debug channel tracing ----
func sendDebugTrace(s *discordgo.Session, m *discordgo.Message, data struct{ Triggered, HardBlocked bool; D Decision; RawLLM, System, User string }) {
	debugChanID := os.Getenv("DEBUG_CHANNEL_ID")
	if debugChanID == "" {
		return
	}

	ch, err := s.Channel(debugChanID)
	if err != nil || ch.Type != discordgo.ChannelTypeGuildText {
		logger.Warnf("invalid debug channel %s: %v", debugChanID, err)
		return
	}

	color := 0x95a5a6
	if data.D.IsScam {
		color = 0xE74C3C
	}
	embed := &discordgo.MessageEmbed{
		Title:       "Debug Trace",
		Description: truncate(m.Content, 900),
		Color:       color,
		Fields: []*discordgo.MessageEmbedField{
			{Name: "Triggered", Value: fmt.Sprintf("%v", data.Triggered), Inline: true},
			{Name: "HardBlocked", Value: fmt.Sprintf("%v", data.HardBlocked), Inline: true},
			{Name: "Decision", Value: fmt.Sprintf("%v (%.2f)", data.D.IsScam, data.D.Confidence), Inline: true},
			{Name: "Reasons", Value: strings.Join(data.D.Reasons, "\n"), Inline: false},
			{Name: "Tags", Value: strings.Join(data.D.Tags, ", "), Inline: false},
			{Name: "Raw", Value: truncate(data.RawLLM, 900), Inline: false},
		},
		Timestamp: time.Now().Format(time.RFC3339),
	}

	components := []discordgo.MessageComponent{}
	if !data.D.IsScam {
		components = []discordgo.MessageComponent{
			&discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.Button{
						Label:    "Flag as scam",
						Style:    discordgo.DangerButton,
						CustomID: "flag_false:" + m.ChannelID + ":" + m.ID,
					},
				},
			},
		}
	}

	_, err = s.ChannelMessageSendComplex(debugChanID, &discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: components,
	})
	if err != nil {
		logger.Warnf("failed to send debug trace: %v", err)
	}
}
