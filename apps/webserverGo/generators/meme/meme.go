package meme

import (
	"image"
	"log/slog"
	"strings"

	"github.com/fogleman/gg"

	"jasper/utils"
)

const (
	fontPath   = "./generators/fun/impact.ttf"
	lineHeight = 1.5
	textMargin = 30
)

func drawOutlined(dc *gg.Context, text string, x float64, y float64) {
	dc.SetRGB(0, 0, 0)
	offsets := []image.Point{
		{X: -2, Y: -2},
		{X: 2, Y: -2},
		{X: -2, Y: 2},
		{X: 2, Y: 2},
	}
	for _, off := range offsets {
		dc.DrawString(text, x+float64(off.X), y+float64(off.Y))
	}
	dc.SetRGB(1, 1, 1)
	dc.DrawString(text, x, y)
}

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

func GenImage(URL string, fontSize float64, topText string, bottomText string) (image.Image, error) {
	img, err := utils.LoadImageFromURL(URL)
	if err != nil {
		slog.Error("Failed to load image from URL", "url", URL, "error", err)
		return nil, err
	}

	imgWidth := img.Bounds().Dx()
	imgHeight := img.Bounds().Dy()

	fontSize = fontSize * float64(imgWidth) / 500.0
	dc := gg.NewContext(imgWidth, imgHeight)
	font, err := utils.LoadFont("./generators/meme/impact.ttf", fontSize)
	if err != nil {
		slog.Error("Failed to load font", "fontPath", fontPath, "error", err)
		return nil, err
	}
	dc.DrawImage(img, 0, 0)
	dc.SetFontFace(font)

	maxTextWidth := float64(imgWidth - 40)
	lineHeightPx := fontSize * lineHeight

	if topText != "" {
		lines := wrapText(dc, topText, maxTextWidth)
		for i, line := range lines {
			w, _ := dc.MeasureString(line)
			x := float64(imgWidth)/2 - w/2
			y := float64(textMargin) + float64(i)*lineHeightPx + fontSize
			drawOutlined(dc, line, x, y)
		}
	}

	if bottomText != "" {
		lines := wrapText(dc, bottomText, maxTextWidth)
		textHeight := float64(len(lines)) * lineHeightPx
		for i, line := range lines {
			w, _ := dc.MeasureString(line)
			x := float64(imgWidth)/2 - w/2
			y := float64(imgHeight) - textMargin - textHeight + fontSize + float64(i)*lineHeightPx
			drawOutlined(dc, line, x, y)
		}
	}
	return dc.Image(), nil
}
