package utils

import (
	"math/rand"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

func getApiKey() string {
    apiKey1 := os.Getenv("YOUTUBE_API_KEY_1")
    apiKey2 := os.Getenv("YOUTUBE_API_KEY_2")
    apiKey3 := os.Getenv("YOUTUBE_API_KEY_3")

    // return one of the three at random
    apiKeys := []string{apiKey1, apiKey2, apiKey3}
    var filtered []string
	for _, str := range apiKeys {
		if str != "" {
			filtered = append(filtered, str)
		}
	}

    if len(filtered) == 0 {
        panic("No valid YouTube API keys found in environment variables")
    }

    randomIndex := rand.Intn(len(filtered))
    return filtered[randomIndex]
}

func FetchChannelData(channelID string) (map[string]interface{}, error) {
	CacheLock.RLock()
	cached, found := Cache[channelID]
	CacheLock.RUnlock()

	if found && time.Since(cached.timestamp) < CacheTTL {
		return cached.data, nil
	}

	url := fmt.Sprintf(
		"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=%s&key=%s",
		channelID, getApiKey())

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, err
	}

	CacheLock.Lock()
	Cache[channelID] = cachedResponse{data: result, timestamp: time.Now()}
	CacheLock.Unlock()

	return result, nil
}
