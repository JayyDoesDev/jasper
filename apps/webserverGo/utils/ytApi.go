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


    statsURL := fmt.Sprintf(
        "https://www.googleapis.com/youtube/v3/channels?part=statistics&fields=kind,etag,pageInfo,items(id,statistics)&id=%s&key=%s",
        channelID, getApiKey())

    statsResp, err := http.Get(statsURL)
    if err != nil {
        return nil, err
    }
    defer statsResp.Body.Close()

    var statsResult map[string]any
    err = json.NewDecoder(statsResp.Body).Decode(&statsResult)
    if err != nil {
        return nil, err
    }


    videoURL := fmt.Sprintf(
        "https://www.googleapis.com/youtube/v3/search?key=%s&channelId=%s&part=snippet,id&order=date&maxResults=1",
        getApiKey(), channelID)

    videoResp, err := http.Get(videoURL)
    if err != nil {
        return nil, err
    }
    defer videoResp.Body.Close()

    var videoResult map[string]any
    err = json.NewDecoder(videoResp.Body).Decode(&videoResult)
    if err != nil {
        return nil, err
    }

    channelStats := statsResult["items"].([]any)[0]
    items, ok := videoResult["items"].([]any)
    if !ok || len(items) == 0 {
        return nil, fmt.Errorf("no videos found for channel %s", channelID)
    }

    var latestVideo map[string]any

    for _, item := range items {
        video, ok := item.(map[string]any)
        if !ok {
            continue
        }
        snippet, ok := video["snippet"].(map[string]any)
        if !ok {
            continue
        }
        publishedAtStr, ok := snippet["publishedAt"].(string)
        if !ok {
            continue
        }

        if latestVideo == nil {
            latestVideo = video
            continue
        }

        latestSnippet := latestVideo["snippet"].(map[string]any)
        latestPublishedAtStr := latestSnippet["publishedAt"].(string)

        if publishedAtStr > latestPublishedAtStr {
            latestVideo = video
        }
    }

    if latestVideo == nil {
        return nil, fmt.Errorf("could not determine latest video for channel %s", channelID)
    }

    merged := map[string]any{
        "channel":   channelStats,
        "latest_video": map[string]any{
            "videoId": latestVideo["id"].(map[string]any)["videoId"],

            "channelId": latestVideo["snippet"].(map[string]any)["channelId"],
            "channelTitle": latestVideo["snippet"].(map[string]any)["channelTitle"],
            "description": latestVideo["snippet"].(map[string]any)["description"],
            "liveBroadcastContent": latestVideo["snippet"].(map[string]any)["liveBroadcastContent"],
            "publishedAt": latestVideo["snippet"].(map[string]any)["publishedAt"],
            "publishTime": latestVideo["snippet"].(map[string]any)["publishTime"],
            "thumbnails": latestVideo["snippet"].(map[string]any)["thumbnails"],
            "title": latestVideo["snippet"].(map[string]any)["title"],

            "videoUrl": fmt.Sprintf("https://www.youtube.com/watch?v=%s", latestVideo["id"].(map[string]any)["videoId"]),
        },
    }

    CacheLock.Lock()
    Cache[channelID] = cachedResponse{data: merged, timestamp: time.Now()}
    CacheLock.Unlock()

    return merged, nil
}
