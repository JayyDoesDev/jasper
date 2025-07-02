package fun

import (
	"encoding/json"
	"image/png"
	"net/http"

	"jasper/generators/meme"
)

func MemeHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		BottomText string  `json:"bottomtext"`
		FontSize   float64 `json:"fontsize"`
		Img        string  `json:"img"`
		TopText    string  `json:"toptext"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestBody.FontSize <= 0 {
		http.Error(w, "Font size must be a positive number", http.StatusBadRequest)
		return
	}
	if requestBody.Img == "" || (requestBody.TopText == "" && requestBody.BottomText == "") {
		http.Error(w, "Image URL and text cannot be empty", http.StatusBadRequest)
		return
	}

	img, err := meme.GenImage(requestBody.Img, requestBody.FontSize, requestBody.TopText, requestBody.BottomText)

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
