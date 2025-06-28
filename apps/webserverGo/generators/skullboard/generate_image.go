package skullboard

import (
	"bytes"
	"context"
	"html/template"
	"image"
	"image/png"
	"log/slog"
	"os"

	"github.com/chromedp/chromedp"
)

type SkullboardPageData struct {
    ReplyAvatarURL      string
    ReplyUsernameColor  string
    ReplyUsername       string
    ReplyContent        string

    AvatarURL           string
    UsernameColor       string
    Username            string
    RoleIconURL         string
    Timestamp           string
    Content             string

    Attachments         []string // sent by the client for some reason
}

func RenderTemplateToImage(data SkullboardPageData) (image.Image, error) {
    tmpl, err := template.ParseFiles("./generators/skullboard/template.html")
    if err != nil {
        slog.Error("Failed to parse template", "error", err)
        return nil, err
    }

    var buf bytes.Buffer
    if err := tmpl.Execute(&buf, data); err != nil {
        slog.Error("Failed to execute template", "error", err)
        return nil, err
    }

    tmpFile, err := os.CreateTemp("", "*.html")
    if err != nil {
        slog.Error("Failed to create temporary file", "error", err)
        return nil, err
    }
    defer os.Remove(tmpFile.Name())

    if _, err := tmpFile.WriteString(buf.String()); err != nil {
        slog.Error("Failed to write to temporary file", "error", err)
        return nil, err
    }
    tmpFile.Close()

    opts := append(chromedp.DefaultExecAllocatorOptions[:],
        chromedp.ExecPath("chromium"), // Set this to the right path for Chromium
        chromedp.Headless,
        chromedp.DisableGPU,
        chromedp.NoSandbox, // optional, for Docker compatibility
    )

    ctx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
    defer cancel()

    ctx, cancel = chromedp.NewContext(ctx)
    defer cancel()

    err = chromedp.Run(ctx,
        chromedp.Navigate("file://" + tmpFile.Name()),
        chromedp.WaitReady("body"),
    )
    if err != nil {
        slog.Error("Failed to take screenshot", "error", err)
        return nil, err
    }

    var width, height int64
    err = chromedp.Run(ctx,
        chromedp.Evaluate(`document.body.scrollWidth`, &width),
        chromedp.Evaluate(`document.body.scrollHeight`, &height),
    )
    if err != nil {
        slog.Error("Failed to evaluate document dimensions", "error", err)
        return nil, err
    }

    err = chromedp.Run(ctx,
        chromedp.EmulateViewport(int64(width), int64(height)),
    )
    if err != nil {
        slog.Error("Failed to emulate viewport", "error", err)
        return nil, err
    }

    var screenshot []byte
    err = chromedp.Run(ctx,
        chromedp.CaptureScreenshot(&screenshot),
    )
    if err != nil {
        slog.Error("Failed to capture screenshot", "error", err)
        return nil, err
    }


    img, err := png.Decode(bytes.NewReader(screenshot))
    if err != nil {
        slog.Error("Failed to decode PNG image", "error", err)
        return nil, err
    }

    return img, nil
}
