package fun

import (
	"encoding/json"
	"image/png"
	"net/http"

	"jasper/generators/meme"
)

func MemeHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    var requestBody struct {
        FontSize float64 `json:"fontsize"`
        Img      string  `json:"img"`
        Position string  `json:"position"`
        Text     string  `json:"text"`
    }
    if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Validate the position
    if requestBody.Position != "top" && requestBody.Position != "bottom" {
        http.Error(w, "Invalid position, must be 'top' or 'bottom'", http.StatusBadRequest)
        return
    }

    // Validate the font size
    if requestBody.FontSize <= 0 {
        http.Error(w, "Font size must be a positive number", http.StatusBadRequest)
        return
    }
    if requestBody.Img == "" || requestBody.Text == "" {
        http.Error(w, "Image URL and text cannot be empty", http.StatusBadRequest)
        return
    }

    // Generate the meme image
    img, err := meme.GenImage(requestBody.Img, requestBody.FontSize, requestBody.Text)

    if err != nil {
        http.Error(w, "Failed to generate meme image: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Set the response header to indicate an image is being returned
    w.Header().Set("Content-Type", "image/png")
    // Write the image to the response
    if err := png.Encode(w, img); err != nil {
        http.Error(w, "Failed to encode image: "+err.Error(), http.StatusInternalServerError)
        return
    }
}
