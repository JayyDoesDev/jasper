package youtube

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"jasper/utils"
)

func SubscriberCountHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	channelID := vars["id"]

	data, err := utils.FetchChannelData(channelID)
	if err != nil {
		http.Error(w, "Error fetching data", http.StatusInternalServerError)
		return
	}

	items := data["channel"].(map[string]any)
	if len(items) == 0 {
		http.Error(w, "Channel not found", http.StatusNotFound)
		return
	}
	stats := items["statistics"].(map[string]any)

	response := map[string]string{
		"subscriberCount": stats["subscriberCount"].(string),
	}

    w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}
