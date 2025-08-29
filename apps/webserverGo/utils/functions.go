package utils

import (
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
	"time"

	"golang.org/x/image/draw"
	"golang.org/x/image/font"
	"golang.org/x/image/font/opentype"
	_ "golang.org/x/image/webp"
)

var allowedImageTypes = map[string]struct{}{
	"image/jpeg": {},
	"image/webp": {},
	".jpg":       {},
	".jpeg":      {},
	".webp":      {},
}

func IsSupportedImageURL(rawURL string) (bool, string, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return false, "", fmt.Errorf("invalid URL: %w", err)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return false, "", fmt.Errorf("unsupported URL scheme: %s", parsed.Scheme)
	}

	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest(http.MethodHead, parsed.String(), nil)
	if err != nil {
		return false, "", err
	}
	resp, err := client.Do(req)
	if err == nil {
		resp.Body.Close()
		if resp.StatusCode >= 200 && resp.StatusCode <= 299 {
			ct := strings.ToLower(strings.TrimSpace(resp.Header.Get("Content-Type")))
			if idx := strings.Index(ct, ";"); idx >= 0 {
				ct = strings.TrimSpace(ct[:idx])
			}
			if strings.HasPrefix(ct, "image/") {
				_, ok := allowedImageTypes[ct]
				return ok, ct, nil
			}
		}
	}

	getReq, err := http.NewRequest(http.MethodGet, parsed.String(), nil)
	if err != nil {
		return false, "", err
	}
	getReq.Header.Set("Range", "bytes=0-511")
	getResp, err := client.Do(getReq)
	if err != nil {
		return false, "", fmt.Errorf("failed to fetch bytes to sniff: %w", err)
	}
	defer getResp.Body.Close()

	if getResp.StatusCode != http.StatusOK && getResp.StatusCode != http.StatusPartialContent {
		return false, "", fmt.Errorf("failed to fetch image: status code %d", getResp.StatusCode)
	}

	buf := make([]byte, 512)
	n, _ := io.ReadFull(getResp.Body, buf)
	buf = buf[:n]
	if n == 0 {
		return false, "", errors.New("empty response")
	}

	sniffed := http.DetectContentType(buf)
	sniffed = strings.ToLower(strings.TrimSpace(sniffed))
	if idx := strings.Index(sniffed, ";"); idx >= 0 {
		sniffed = strings.TrimSpace(sniffed[:idx])
	}

	if strings.HasPrefix(sniffed, "image/") {
		if _, ok := allowedImageTypes[sniffed]; !ok {
			return false, sniffed, fmt.Errorf("image type %s not allowed", sniffed)
		}
		return true, sniffed, nil
	}

	ext := strings.ToLower(path.Ext(parsed.Path))
	if _, ok := allowedImageTypes[ext]; ok {
		return true, "", nil
	}

	return false, sniffed, fmt.Errorf("URL does not appear to be an allowed image (sniffed: %s)", sniffed)
}

func LoadImageFromURL(rawURL string) (image.Image, error) {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return nil, fmt.Errorf("unsupported URL scheme: %s", parsed.Scheme)
	}

	ok, mime, err := IsSupportedImageURL(rawURL)
	if err != nil {
		return nil, err
	}
	if !ok {
		if mime == "" {
			return nil, errors.New("URL is not a supported image")
		}
		return nil, fmt.Errorf("URL is not a supported image (type %s)", mime)
	}

	client := &http.Client{Timeout: 15 * time.Second}

	resp, err := client.Get(parsed.String())
	if err != nil {
		return nil, fmt.Errorf("failed to fetch image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch image: status code %d", resp.StatusCode)
	}

	const maxBytes = 25 * 1024 * 1024
	limitedReader := io.LimitReader(resp.Body, maxBytes)

	img, _, err := image.Decode(limitedReader)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	return img, nil
}

func ResizeImage(img image.Image, width, height int) image.Image {
	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	draw.CatmullRom.Scale(dst, dst.Bounds(), img, img.Bounds(), draw.Over, nil)
	return dst
}

func ConvertHexColor(hex string) (float64, float64, float64) {
	if len(hex) != 7 || hex[0] != '#' {
		return 1, 1, 1
	}
	var r, g, b uint8
	_, err := fmt.Sscanf(hex[1:], "%02x%02x%02x", &r, &g, &b)
	if err != nil {
		return 1, 1, 1
	}
	return float64(r) / 255.0, float64(g) / 255.0, float64(b) / 255.0
}

func LoadFont(path string, size float64) (font.Face, error) {
	fontBytes, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	f, err := opentype.Parse(fontBytes)
	if err != nil {
		return nil, err
	}
	return opentype.NewFace(f, &opentype.FaceOptions{
		Size:    size,
		DPI:     72,
		Hinting: font.HintingFull,
	})
}
