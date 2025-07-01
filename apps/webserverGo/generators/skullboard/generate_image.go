package skullboard

import (
	"image"
	"log/slog"

	"github.com/fogleman/gg"
	"golang.org/x/image/font"

	"jasper/utils"
)

type MessageData struct {
	ReplyAvatar        string
	ReplyUsernameColor string
	ReplyUsername      string
	ReplyContent       string

	Avatar        string
	UsernameColor string
	Username      string
	RoleIconURL   string
	Timestamp     string
	Content       string

	Attachments []string
}

const (
	padding     = 20
	pfpSize     = 48
	textMargin  = 10
	fontSize    = 16.0
	lineHeight  = fontSize * 1.5
	messageBoxX = float64(padding + pfpSize + textMargin)
)

func calculateWidthHeight(font font.Face, data MessageData) (int, int, error) {
	width := 800

	tempDC := gg.NewContext(10000, 10000)
	tempDC.SetFontFace(font)

	lines := tempDC.WordWrap(data.Content, float64(width))

	longestLineWidth := 0.0
	for _, line := range lines {
		w, _ := tempDC.MeasureString(line)
		if w > longestLineWidth {
			longestLineWidth = w
		}
	}

	width = int(longestLineWidth) + padding*2 + pfpSize + textMargin

	messageMaxWidth := float64(width - padding*2 - pfpSize - textMargin)
	lines = tempDC.WordWrap(data.Content, messageMaxWidth)
	messageHeight := float64(len(lines)) * lineHeight

	usernameHeight := fontSize + 2
	usernameLength, _ := tempDC.MeasureString(data.Username)
	timestampLength, _ := tempDC.MeasureString(data.Timestamp)
	if data.RoleIconURL != "" {
		roleIconWidth, _ := tempDC.MeasureString("RoleIcon")
		usernameLength += roleIconWidth + 10
	}
	if padding*2+pfpSize+textMargin+usernameLength+timestampLength > float64(width) {
		width = int(padding*2 + pfpSize + textMargin + usernameLength + timestampLength)
	}
	contentHeight := usernameHeight + messageHeight

	if data.ReplyContent != "" {
		contentHeight += 30
		if width < 300 {
			width = 300
		}
	}

	if len(data.Attachments) > 0 {
		for _, attachmentURL := range data.Attachments {
			attachmentImage, err := utils.LoadImageFromURL(attachmentURL)
			if err != nil {
				slog.Error("Failed to load attachment image", "url", attachmentURL, "error", err)
				return 0, 0, err
			}
			attachmentWidth := float64(attachmentImage.Bounds().Dx())
			attachmentHeight := float64(attachmentImage.Bounds().Dy())
			contentHeight += attachmentHeight + 20

			attachmentTotalWidth := int(attachmentWidth + messageBoxX)
			if attachmentTotalWidth > width {
				width = attachmentTotalWidth
			}
		}
	}

	totalWidth := int(width)
	totalHeight := int(contentHeight + padding*2)

	return totalWidth, totalHeight, nil
}

func GenerateDiscordMessage(data MessageData) (image.Image, error) {
	font, err := utils.LoadFont("./generators/skullboard/Roboto-Regular.ttf", fontSize)
	if err != nil {
		slog.Error("Failed to load font", "fontPath", "./generators/skullboard/Roboto-Regular.ttf", "error", err)
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
		roleIcon = utils.ResizeImage(roleIcon, 22, 22) // Resize to 16x16
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

	dc.SetRGB(0.9, 0.9, 0.9)
	lines := dc.WordWrap(data.Content, float64(totalWidth-padding*2-pfpSize-textMargin))
	for _, line := range lines {
		dc.DrawStringAnchored(line, messageBoxX, currentY, 0, 0)
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
