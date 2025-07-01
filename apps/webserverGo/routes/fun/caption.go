package fun

import (
	"encoding/json"
	"image/png"
	"net/http"

	"jasper/generators/fun"
)

func CaptionHandler(w http.ResponseWriter, r *http.Request) {
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

	if requestBody.Position != "top" && requestBody.Position != "bottom" {
		http.Error(w, "Invalid position, must be 'top' or 'bottom'", http.StatusBadRequest)
		return
	}

	if requestBody.FontSize <= 0 {
		http.Error(w, "Font size must be a positive number", http.StatusBadRequest)
		return
	}
	if requestBody.Img == "" || requestBody.Text == "" {
		http.Error(w, "Image URL and text cannot be empty", http.StatusBadRequest)
		return
	}

	img, err := fun.MakeCaptionImage(requestBody.Img, requestBody.FontSize, requestBody.Text, requestBody.Position)

	if err != nil {
		http.Error(w, "Failed to generate meme image: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	if err := png.Encode(w, img); err != nil {
		http.Error(w, "Failed to encode image: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
