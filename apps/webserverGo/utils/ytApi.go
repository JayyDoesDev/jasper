package utils

import (
    "time"
    "encoding/json"
    "fmt"
    "net/http"
    "os"

)

func FetchChannelData(channelID string) (map[string]interface{}, error) {
	CacheLock.RLock()
	cached, found := Cache[channelID]
	CacheLock.RUnlock()

	if found && time.Since(cached.timestamp) < CacheTTL {
		return cached.data, nil
	}

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
	if err != nil {
		return nil, err
	}

	CacheLock.Lock()
	Cache[channelID] = cachedResponse{data: result, timestamp: time.Now()}
	CacheLock.Unlock()

	return result, nil
}
