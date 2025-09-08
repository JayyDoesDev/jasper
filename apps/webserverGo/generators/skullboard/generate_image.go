package skullboard

import (
	"image"
	"image/color"
	"log/slog"
	"regexp"
	"strings"

	"github.com/fogleman/gg"
	"golang.org/x/image/font"

	"jasper/utils"
)

type MessageData struct {
	ReplyAvatar        string
	ReplyUsernameColor string
	ReplyUsername      string
	ReplyContent       string

	Avatar          string
	UsernameColor   string
	Username        string
	RoleIconURL     string
	Timestamp       string
	Content         string
    Mentions    []string

	Attachments []string
}

const (
	padding     = 20
	pfpSize     = 48
	textMargin  = 10
	fontSize    = 16
	lineHeight  = fontSize * 1.5
	messageBoxX = float64(padding + pfpSize + textMargin)
)

func replaceMentionsFromMessageContent(content string, mentions []string) string {
    for _, mention := range mentions {
        splittedMention := strings.Split(mention, ":")
        if len(splittedMention) != 2 {
            continue
        }
        content = strings.ReplaceAll(content, "<@"+splittedMention[0]+">", "\u200b@"+splittedMention[1]+"\u200b")
        content = strings.ReplaceAll(content, "<@!"+splittedMention[0]+">", "\u200b@"+splittedMention[1]+"\u200b")
        content = strings.ReplaceAll(content, "<#"+splittedMention[0]+">", "\u200b#"+splittedMention[1]+"\u200b")
    }
    return content
}

func calculateWidthHeight(font font.Face, data MessageData) (int, int, error) {
	width := 800 
    height := 0

	tempDC := gg.NewContext(10000, 10000)
	tempDC.SetFontFace(font)

	messageMaxWidth := float64(width - padding*2 - pfpSize - textMargin)
	lines := tempDC.WordWrap(replaceMentionsFromMessageContent(data.Content, data.Mentions), messageMaxWidth)
	messageHeight := float64(len(lines)) * lineHeight
    height = int(messageHeight + padding*2)


	usernameHeight := fontSize + 2
	height += usernameHeight

    // Add reply height if present
    if data.ReplyContent != "" {
        height += 50
    }

	// Add attachment heights
	if len(data.Attachments) > 0 {
		for _, attachmentURL := range data.Attachments {
			attachmentImage, err := utils.LoadImageFromURL(attachmentURL)
			if err != nil {
				slog.Error("Failed to load attachment image", "url", attachmentURL, "error", err)
				return 0, 0, err
			}
			
			// Scale attachment to fit within available width if necessary
			attachmentWidth := attachmentImage.Bounds().Dx()
			attachmentHeight := attachmentImage.Bounds().Dy()
			
			maxAttachmentWidth := width - int(messageBoxX)
			if attachmentWidth > maxAttachmentWidth {
				// Scale down proportionally
				scale := float64(maxAttachmentWidth) / float64(attachmentWidth)
				attachmentHeight = int(float64(attachmentHeight) * scale)
			}
			
			height += attachmentHeight + 20
		}
	}

	return width, height, nil
}

func GenerateDiscordMessage(data MessageData) (image.Image, error) {
	font, err := utils.LoadFont("./fonts/Roboto-Regular.ttf", fontSize)
	if err != nil {
		slog.Error("Failed to load font", "fontPath", "./fonts/Roboto-Regular.ttf", "error", err)
		return nil, err
	}

	totalWidth, totalHeight, err := calculateWidthHeight(font, data)
	if err != nil {
		slog.Error("Failed to calculate width and height", "error", err)
		return nil, err
	}

	dc := gg.NewContext(totalWidth, totalHeight)
	dc.SetRGB(50/255.0, 51/255.0, 56/255.0)
	dc.Clear()
	dc.SetFontFace(font)

	currentY := float64(padding)

	if data.ReplyContent != "" {
		currentX := padding + 18
		replySymbol, err := gg.LoadImage("./generators/skullboard/discord_reply.png")
		if err != nil {
			slog.Error("Failed to load reply symbol image", "error", err)
			return nil, err
		}
		replySymbol = utils.ResizeImage(replySymbol, 104*40/54, 40)
		dc.DrawImage(replySymbol, int(currentX), int(currentY))
		currentX += 104*40/54 + 10

		replyAvatar, err := utils.LoadImageFromURL(data.ReplyAvatar)
		if err != nil {
			slog.Error("Failed to load reply avatar image", "url", data.ReplyAvatar, "error", err)
			return nil, err
		}
		replyAvatar = utils.ResizeImage(replyAvatar, 30, 30)
		dc.DrawCircle(float64(currentX+15), float64(currentY+15), 15)
		dc.Clip()
		dc.DrawImageAnchored(replyAvatar, int(currentX)+15, int(currentY)+15, 0.5, 0.5)
		dc.ResetClip()
		currentX += 35
		currentY += 10

		dc.SetRGB(utils.ConvertHexColor(data.ReplyUsernameColor))
		dc.DrawStringAnchored(data.ReplyUsername, float64(currentX), currentY, 0, 0.5)
		usernameWidth, _ := dc.MeasureString(data.ReplyUsername)
		currentX += int(usernameWidth + 5)

		dc.SetRGB(0.7, 0.7, 0.7)
		dc.DrawStringAnchored(data.ReplyContent, float64(currentX), currentY, 0, 0.5)

		currentY += 30
	}

	pfp, err := utils.LoadImageFromURL(data.Avatar)
	if err != nil {
		slog.Error("Failed to load avatar image", "url", data.Avatar, "error", err)
		return nil, err
	}
	pfp = utils.ResizeImage(pfp, pfpSize, pfpSize)
	dc.DrawCircle(float64(padding+pfpSize/2), float64(currentY+pfpSize/2), float64(pfpSize/2))
	dc.Clip()
	dc.DrawImageAnchored(pfp, padding+pfpSize/2, int(currentY)+pfpSize/2, 0.5, 0.5)
	dc.ResetClip()

	dc.SetRGB(utils.ConvertHexColor(data.UsernameColor))
	dc.DrawStringAnchored(data.Username, messageBoxX, float64(currentY+fontSize), 0, 0)
	usernameWidth, _ := dc.MeasureString(data.Username)

	if data.RoleIconURL != "" {
		roleIcon, err := utils.LoadImageFromURL(data.RoleIconURL)
		if err != nil {
			slog.Error("Failed to load role icon image", "url", data.RoleIconURL, "error", err)
			return nil, err
		}
		roleIcon = utils.ResizeImage(roleIcon, 22, 22)
		dc.DrawImageAnchored(roleIcon, int(messageBoxX+usernameWidth+20), int(currentY+fontSize), 0.5, 0.75)
	}

	timestampX := messageBoxX + usernameWidth + 10
	if data.RoleIconURL != "" {
		timestampX += 18 + 10
	}
	dc.SetFontFace(font)
	dc.SetRGB(0.7, 0.7, 0.7)
	dc.DrawStringAnchored(data.Timestamp, timestampX, float64(currentY+fontSize), 0, 0)
	currentY += fontSize * 2.5

    mentionColor := color.RGBA{R: 66, G: 135, B: 245, A: 255}
    normalColor := color.RGBA{R: 230, G: 230, B: 230, A: 255}

	lines := dc.WordWrap(replaceMentionsFromMessageContent(data.Content, data.Mentions), float64(totalWidth-padding*2-pfpSize-textMargin))
    regex := regexp.MustCompile(`\x{200b}(@|#)[^ ]+\x{200b}`)

	for _, line := range lines {
        x := messageBoxX
        lastIndex := 0
        matches := regex.FindAllStringIndex(line, -1)

        for _, match := range matches {
            start, end := match[0], match[1]
            if start > lastIndex {
                dc.SetColor(normalColor)
                text := line[lastIndex:start]
                dc.DrawStringAnchored(text, x, currentY, 0, 0)
                w, _ := dc.MeasureString(text)
                x += w
            }
            dc.SetColor(mentionColor)
            text := line[start:end]
            dc.DrawStringAnchored(text, x, currentY, 0, 0)
            w, _ := dc.MeasureString(text)
            x += w
            lastIndex = end
        }
        if lastIndex < len(line) {
            dc.SetColor(normalColor)
            text := line[lastIndex:]
            dc.DrawStringAnchored(text, x, currentY, 0, 0)
        }
        currentY += lineHeight
	}

	if len(data.Attachments) > 0 {
		for _, attachmentURL := range data.Attachments {
			attachmentImage, err := utils.LoadImageFromURL(attachmentURL)
			if err != nil {
				slog.Error("Failed to load attachment image", "url", attachmentURL, "error", err)
				return nil, err
			}
			attachmentY := int(currentY)
			dc.DrawImage(attachmentImage, int(messageBoxX), attachmentY)
			currentY += float64(attachmentImage.Bounds().Dy()) + 20
		}
	}

	return dc.Image(), nil
}