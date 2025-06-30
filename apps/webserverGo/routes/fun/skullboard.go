package fun

import (
	"encoding/json"
	"image/png"
	"log/slog"
	"net/http"

	"jasper/generators/skullboard"
)

func SkullboardHandler(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		Attachments        []string `json:"attachments"`
		Avatar             string   `json:"avatar"`
		ChannelId          string   `json:"channelId"`
		ChannelName        string   `json:"channelName"`
		Content            string   `json:"content"`
		CustomData         any      `json:"customData"`
		RoleIcon           string   `json:"roleIcon"`
		RoleName           string   `json:"roleName"`
		Timestamp          string   `json:"timestamp"`
		UserId             string   `json:"userId"`
		Username           string   `json:"username"`
		UsernameColor      string   `json:"usernameColor"`
		ReplyAvatar        string   `json:"replyAvatar"`
		ReplyContent       string   `json:"replyContent"`
		ReplyUsername      string   `json:"replyUsername"`
		ReplyUsernameColor string   `json:"replyUsernameColor"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		slog.Error("Failed to decode request body", "error", err)
		return
	}

	img, err := skullboard.GenerateDiscordMessage(skullboard.MessageData{
		ReplyAvatarURL:     requestBody.ReplyAvatar,
		ReplyUsernameColor: requestBody.ReplyUsernameColor,
		ReplyUsername:      requestBody.ReplyUsername,
		ReplyContent:       requestBody.ReplyContent,

		AvatarURL:     requestBody.Avatar,
		UsernameColor: requestBody.UsernameColor,
		Username:      requestBody.Username,
		RoleIconURL:   requestBody.RoleIcon,
		Timestamp:     requestBody.Timestamp,
		Content:       requestBody.Content,

		Attachments: requestBody.Attachments,
	})

	if err != nil {
		http.Error(w, "Failed to generate image: "+err.Error(), http.StatusInternalServerError)
		slog.Error("Failed to generate skullboard image", "error", err)
		return
	}
	w.Header().Set("Content-Type", "image/png")

	if err := png.Encode(w, img); err != nil {
		http.Error(w, "Failed to encode image: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
