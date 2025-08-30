package fun

import (
	"encoding/json"
	"image/png"
	"jasper/generators/speechbubble"
	"net/http"
)

func BubbleHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Img      string `json:"img"`
		Position string `json:"position"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestBody.Position != "top" && requestBody.Position != "bottom" {
		http.Error(w, "Invalid position, must be 'top' or 'bottom'", http.StatusBadRequest)
		return
	}

	img, err := speechbubble.GenImage(requestBody.Img, requestBody.Position)

	if err != nil {
		http.Error(w, "Failed to generate speechbubble image: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	if err := png.Encode(w, img); err != nil {
		http.Error(w, "Failed to encode image: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
