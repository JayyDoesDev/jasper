package meme

import (
	"image"
	"log/slog"
	"strings"

	"github.com/fogleman/gg"

	"jasper/utils"
)

const (
	fontPath   = "./generators/meme/impact.ttf"
	lineHeight = 1.5
	textMargin = 30
)

func wrapText(dc *gg.Context, text string, maxWidth float64) []string {
	words := strings.Fields(text)
	var lines []string
	if len(words) == 0 {
		return lines
	}

	var line string
	for _, word := range words {
		testLine := line
		if testLine != "" {
			testLine += " "
		}
		testLine += word

		width, _ := dc.MeasureString(testLine)
		if width > maxWidth && line != "" {
			lines = append(lines, line)
			line = word
		} else {
			line = testLine
		}
	}
	if line != "" {
		lines = append(lines, line)
	}
	return lines
}

// pls make default font size 72 tyvm
func GenImage(URL string, fontSize float64, caption string, position string) (image.Image, error) {
	img, err := utils.LoadImageFromURL(URL)
	if err != nil {
        slog.Error("Failed to load image from URL", "url", URL, "error", err)
        return nil, err
	}

	imgWidth := img.Bounds().Dx()
	imgHeight := img.Bounds().Dy()

	dc := gg.NewContext(imgWidth, 1000)
	if err := dc.LoadFontFace(fontPath, fontSize); err != nil {
        slog.Error("Failed to load font face", "fontPath", fontPath, "error", err)
		return nil, err
	}

	maxTextWidth := float64(imgWidth - 40)
	lines := wrapText(dc, caption, maxTextWidth)
	lineHeightPx := fontSize * lineHeight
	textHeight := float64(len(lines)) * lineHeightPx
	boxHeight := int(textHeight + float64(2*textMargin))
	totalHeight := boxHeight + imgHeight

	dc = gg.NewContext(imgWidth, totalHeight)
	if err := dc.LoadFontFace(fontPath, fontSize); err != nil {
        slog.Error("Failed to load font face", "fontPath", fontPath, "error", err)
		return nil, err
	}

	dc.SetRGB(1, 1, 1)
    if position == "top" {
		dc.DrawRectangle(0, 0, float64(imgWidth), float64(boxHeight))
	} else {
		dc.DrawRectangle(0, float64(imgHeight), float64(imgWidth), float64(boxHeight))
	}
	dc.Fill()

	dc.SetRGB(0, 0, 0)
	var startY float64
    if position == "top" {
		startY = float64(boxHeight)/2 - textHeight/2 + fontSize
	} else {
		startY = float64(imgHeight) + float64(boxHeight)/2 - textHeight/2 + fontSize
	}
	for i, line := range lines {
		w, _ := dc.MeasureString(line)
		x := float64(imgWidth)/2 - w/2
		y := startY + float64(i)*lineHeightPx
		dc.DrawString(line, x, y)
	}

    if position == "top" {
		dc.DrawImageAnchored(img, imgWidth/2, boxHeight+imgHeight/2, 0.5, 0.5)
	} else {
		dc.DrawImageAnchored(img, imgWidth/2, imgHeight/2, 0.5, 0.5)
	}

	return dc.Image(), nil
}
