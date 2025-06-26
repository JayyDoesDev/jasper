package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
    "github.com/joho/godotenv"
)

// Middleware to check for the Authorization header
func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("JASPER-API-KEY")
		if header == "" || header != os.Getenv("JASPER_API_KEY") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Fetch channel info from YouTube Data API
func fetchChannelData(channelID string) (map[string]interface{}, error) {
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	url := fmt.Sprintf(
		"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=%s&key=%s",
		channelID, apiKey)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	return result, err
}

// Handler for /youtube/{id}
func channelInfoHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	channelID := vars["id"]

	data, err := fetchChannelData(channelID)
	if err != nil {
		http.Error(w, "Error fetching data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(data)
}

// Handler for /youtube/{id}/subscribers
func subscriberCountHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	channelID := vars["id"]

	data, err := fetchChannelData(channelID)
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

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found or failed to load")
    }

	r := mux.NewRouter()
	r.Use(authMiddleware)

	r.HandleFunc("/youtube/{id}", channelInfoHandler).Methods("GET")
	r.HandleFunc("/youtube/{id}/subscribers", subscriberCountHandler).Methods("GET")

	fmt.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
