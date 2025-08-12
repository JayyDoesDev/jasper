package safety

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
)

// Start initializes and runs the Discord bot session.
func Start() {
	_ = godotenv.Load()

	cfg, err := LoadConfig()
	if err != nil {
		Logger.Fatalf("failed to load config: %v", err)
	}

	token := os.Getenv("DISCORD_TOKEN")
	if token == "" {
		Logger.Fatal("DISCORD_TOKEN env var is required")
	}

	sess, err := discordgo.New("Bot " + token)
	if err != nil {
		Logger.Fatalf("failed to create discord session: %v", err)
	}

	sess.Identify.Intents = discordgo.IntentsGuildMessages | discordgo.IntentsGuilds | discordgo.IntentsMessageContent

	sess.AddHandler(func(s *discordgo.Session, r *discordgo.Ready) {
		Logger.Infof("Logged in as %s. Provider=%s, model=%s, productionReady=%v", r.User.Username, cfg.Provider, cfg.Model, cfg.ProductionReady)
	})

	sess.AddHandler(func(s *discordgo.Session, m *discordgo.MessageCreate) {
		if m.Author.Bot {
			return
		}
		ProcessMessage(context.Background(), cfg, s, m.Message)
	})

	// This handler processes button clicks from the moderation alerts.
	sess.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if i.Type != discordgo.InteractionMessageComponent {
			return
		}
		customID := i.MessageComponentData().CustomID
		parts := strings.Split(customID, ":")
		if len(parts) < 3 {
			return
		}
		action, channelID, targetMsgID := parts[0], parts[1], parts[2]

		// Permission check: only users who can manage messages can use the buttons.
		p, err := s.UserChannelPermissions(i.Member.User.ID, i.ChannelID)
		if err != nil {
			Logger.Warnf("failed to get user permissions for %s: %v", i.Member.User.ID, err)
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{Content: "Failed to verify your permissions.", Flags: discordgo.MessageFlagsEphemeral},
			})
			return
		}
		if p&discordgo.PermissionManageMessages == 0 {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{Content: "You lack permission to perform this action.", Flags: discordgo.MessageFlagsEphemeral},
			})
			return
		}

		msg, _ := s.ChannelMessage(channelID, targetMsgID)
		if msg == nil {
			msg = MessageCache[targetMsgID]
		}
		if msg == nil {
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{Content: "Original message could not be found.", Flags: discordgo.MessageFlagsEphemeral},
			})
			return
		}

		authorAge := 0
		if msg != nil && msg.Author != nil {
			authorAge = UserAgeDays(msg.Author)
		}
		meta := struct {
			Channel       string "json:\"channel,omitempty\""
			AuthorAgeDays int    "json:\"authorAgeDays,omitempty\""
			MessageID     string `json:"messageId,omitempty"`
		}{channelID, authorAge, targetMsgID}

		switch action {
		case "scam_del":
			if msg != nil {
				s.ChannelMessageDelete(channelID, targetMsgID)
			}
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseChannelMessageWithSource,
				Data: &discordgo.InteractionResponseData{
					Content: "Message deleted.",
					Flags:   discordgo.MessageFlagsEphemeral,
				},
			})
		case "scam_correct":
			if msg == nil {
				s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{Type: discordgo.InteractionResponseChannelMessageWithSource, Data: &discordgo.InteractionResponseData{Content: "Original message no longer exists.", Flags: discordgo.MessageFlagsEphemeral}})
				return
			}
			_ = AdoptExample(AdoptionInput{Content: msg.Content, Predicted: "scam", GroundTruth: "scam", Confidence: 1, Meta: meta, Reason: fmt.Sprintf("mod_%s_approved", i.Member.User.ID)})
			updateEmbed(s, i, "Marked as correct by "+i.Member.User.Username, createModerationComponents(cfg, msg, true, true, true))
		case "scam_incorrect":
			if msg == nil {
				s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{Type: discordgo.InteractionResponseChannelMessageWithSource, Data: &discordgo.InteractionResponseData{Content: "Original message no longer exists.", Flags: discordgo.MessageFlagsEphemeral}})
				return
			}
			_ = AdoptExample(AdoptionInput{Content: msg.Content, Predicted: "scam", GroundTruth: "not_scam", Confidence: 1, Meta: meta, Reason: fmt.Sprintf("mod_%s_rejected", i.Member.User.ID)})
			updateEmbed(s, i, "Marked as incorrect by "+i.Member.User.Username, createModerationComponents(cfg, msg, true, true, true))
		case "flag_false":
			if msg == nil {
				s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{Type: discordgo.InteractionResponseChannelMessageWithSource, Data: &discordgo.InteractionResponseData{Content: "Original message missing.", Flags: discordgo.MessageFlagsEphemeral}})
				return
			}
			_ = AdoptExample(AdoptionInput{Content: msg.Content, Predicted: "not_scam", GroundTruth: "scam", Confidence: 1, Meta: meta, Reason: fmt.Sprintf("mod_%s_flagged", i.Member.User.ID)})
			updateEmbed(s, i, "Flagged as scam by "+i.Member.User.Username, []discordgo.MessageComponent{})
		}
	})

	if err := sess.Open(); err != nil {
		Logger.Fatalf("cannot open Discord session: %v", err)
	}
	Logger.Info("Safety bot is running")

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	_ = sess.Close()
	Logger.Info("Shutdown complete")
}

func updateEmbed(s *discordgo.Session, i *discordgo.InteractionCreate, text string, components []discordgo.MessageComponent) {
	if i.Message == nil || len(i.Message.Embeds) == 0 {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Action recorded: " + text,
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}
	embed := i.Message.Embeds[0]
	if embed.Footer == nil {
		embed.Footer = &discordgo.MessageEmbedFooter{}
	}
	embed.Footer.Text = text
	embeds := []*discordgo.MessageEmbed{embed}
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseUpdateMessage,
		Data: &discordgo.InteractionResponseData{
			Embeds:     embeds,
			Components: components,
		},
	})
}
