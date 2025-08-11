package safety

import (
	"fmt"
	"strings"
)

type LabeledExample struct {
	Content string
	Label   string
	Reason  string
	Meta    struct {
		AuthorAgeDays int
	}
}

func buildSystemPrompt(examples []LabeledExample) string {
	criteria := []string{
		"- Requests for DMs, off-platform contacts, wallets, seeds, private keys.",
		"- Fake giveaways/airdrops, Nitro scams, payment/billing links.",
		"- Urgency, push to bypass moderators, or impersonation.",
		"- Links to suspicious domains or URL shorteners.",
		"- Language patterns indicative of social engineering.",
	}

	exLines := make([]string, 0, len(examples))
	for i, e := range examples {
		ctx := ""
		if e.Meta.AuthorAgeDays > 0 {
			ctx = fmt.Sprintf(" (author_age_days=%d)", e.Meta.AuthorAgeDays)
		}
		line := fmt.Sprintf("Example %d [%s]%s:\n%s\nReason: %s", i+1, strings.ToUpper(e.Label), ctx, e.Content, e.Reason)
		exLines = append(exLines, line)
	}

	schema := `You are a security classifier. Output ONLY valid JSON matching:
{
  "is_scam": boolean,
  "confidence": number,
  "reasons": string[],
  "tags": string[],
  "risk_factors": {
    "impersonation"?: number,
    "off_platform"?: number,
    "credential_theft"?: number,
    "malware_link"?: number
  }
}`

	parts := []string{
		schema,
		"Be conservative: only mark true when signals are clear. Prefer false if ambiguous.",
		"Do not include code fences or commentary. Return JSON only.",
		"",
		"Scam indicators:",
		strings.Join(criteria, "\n"),
		"",
		"Few-shot guidance:",
		strings.Join(exLines, "\n\n"),
	}
	return strings.Join(parts, "\n")
}

func buildUserPrompt(content string, authorAgeDays int, links []string) string {
	linkStr := "none"
	if len(links) > 0 {
		linkStr = strings.Join(links, ", ")
	}
	return fmt.Sprintf("Message: \"\"\"%s\"\"\"\nAuthorAgeDays: %d\nLinks: %s", content, authorAgeDays, linkStr)
}
