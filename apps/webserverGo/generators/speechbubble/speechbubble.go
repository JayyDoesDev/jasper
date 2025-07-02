package speechbubble

import (
	"image"
	"log/slog"

	"github.com/fogleman/gg"

	"jasper/utils"
)

func Flip(img image.Image) image.Image {
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	dc := gg.NewContext(width, height)
	dc.Scale(1, -1)
	dc.Translate(0, -float64(height))
	dc.DrawImage(img, 0, 0)
	return dc.Image()
}

func ScaleBubble(img image.Image, targetWidth int) image.Image {
	originalBounds := img.Bounds()
	originalWidth := originalBounds.Dx()
	originalHeight := originalBounds.Dy()

	scale := float64(targetWidth) / float64(originalWidth)
	targetHeight := int(float64(originalHeight) * scale)

	dc := gg.NewContext(targetWidth, targetHeight)
	dc.Scale(scale, scale)
	dc.DrawImage(img, 0, 0)
	return dc.Image()
}

func GenImage(URL string, position string) (image.Image, error) {
	img, err := utils.LoadImageFromURL(URL)
	if err != nil {
		slog.Error("Failed to load image from URL", "url", URL, "error", err)
		return nil, err
	}

	imgWidth := img.Bounds().Dx()
	imgHeight := img.Bounds().Dy()

	bubbleImg, err := gg.LoadImage("./generators/speechbubble/speechbubble.png")
	if err != nil {
		slog.Error("Failed to load speech bubble image", "error", err)
		return nil, err
	}

	dc := gg.NewContext(imgWidth, imgHeight)
	dc.DrawImage(img, 0, 0)

	bubbleImg = ScaleBubble(bubbleImg, imgWidth)
	bubbleHeight := bubbleImg.Bounds().Dy()

	if position == "top" {
		dc.DrawImage(bubbleImg, 0, 0)
	} else {
		y := imgHeight - bubbleHeight
		dc.DrawImage(Flip(bubbleImg), 0, y)
	}
	return dc.Image(), nil
}
