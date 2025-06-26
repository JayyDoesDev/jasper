package image_gen

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/fogleman/gg"
)

const (
	fontPath   = "./impact.ttf"
	lineHeight = 1.5
	textMargin = 50
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

func loadImageFromURL(url string) (image.Image, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch image: status code %d", resp.StatusCode)
	}

	img, err := png.Decode(resp.Body)
	if err != nil {
		return nil, err
	}
	return img, nil
}

// pls make default font size 72 tyvm
func GenImage(URL string, fontSize float64, caption string) {
	img, err := loadImageFromURL(URL)
	if err != nil {
		log.Fatal(err)
	}

	imgWidth := img.Bounds().Dx()
	imgHeight := img.Bounds().Dy()

	dc := gg.NewContext(imgWidth, 1000)
	if err := dc.LoadFontFace(fontPath, fontSize); err != nil {
		log.Fatal(err)
	}

	maxTextWidth := float64(imgWidth - 40)
	lines := wrapText(dc, caption, maxTextWidth)
	lineHeightPx := fontSize * lineHeight
	textHeight := float64(len(lines)) * lineHeightPx
	boxHeight := int(textHeight + float64(2*textMargin))
	totalHeight := boxHeight + imgHeight

	dc = gg.NewContext(imgWidth, totalHeight)
	if err := dc.LoadFontFace(fontPath, fontSize); err != nil {
		log.Fatal(err)
	}

	dc.SetRGB(1, 1, 1)
	dc.DrawRectangle(0, 0, float64(imgWidth), float64(boxHeight))
	dc.Fill()

	dc.SetRGB(0, 0, 0)
	startY := float64(boxHeight)/2 - textHeight/2 + fontSize
	for i, line := range lines {
		w, _ := dc.MeasureString(line)
		x := float64(imgWidth)/2 - w/2
		y := startY + float64(i)*lineHeightPx
		dc.DrawString(line, x, y)
	}

	dc.DrawImageAnchored(img, imgWidth/2, boxHeight+imgHeight/2, 0.5, 0.5)

	outFile, err := os.Create("output.png")
	if err != nil {
		log.Fatal(err)
	}
	defer outFile.Close()

	if err := png.Encode(outFile, dc.Image()); err != nil {
		log.Fatal(err)
	}
}
