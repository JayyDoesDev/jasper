package youtube

import (
    "net/http"
    "encoding/json"

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

	items := data["items"].([]interface{})
	if len(items) == 0 {
		http.Error(w, "Channel not found", http.StatusNotFound)
		return
	}
	stats := items[0].(map[string]interface{})["statistics"].(map[string]interface{})

	response := map[string]string{
		"subscriberCount": stats["subscriberCount"].(string),
	}
	json.NewEncoder(w).Encode(response)
}
