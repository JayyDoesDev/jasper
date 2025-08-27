package providers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type openAIClient struct {
	baseURL string
	apiKey  string
	name    string
}

func NewOpenAIClient(name, baseURL, apiKey string) Client {
	return &openAIClient{name: name, baseURL: baseURL, apiKey: apiKey}
}

func (c *openAIClient) Name() string { return c.name }

func (c *openAIClient) Classify(model, systemPrompt, userPrompt string) (Response, error) {
	url := fmt.Sprintf("%s/chat/completions", c.baseURL)
	payload := map[string]any{
		"model": model,
		"response_format": map[string]any{"type": "json_object"},
		"messages": []map[string]any{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userPrompt},
		},
		"temperature": 0,
	}
	bts, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, url, bytes.NewReader(bts))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	var parsed struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	_ = json.Unmarshal(data, &parsed)
	content := ""
	if len(parsed.Choices) > 0 {
		content = parsed.Choices[0].Message.Content
	}

	var js map[string]any
	_ = json.Unmarshal([]byte(content), &js)
	return Response{Raw: content, JSON: js}, nil
}

func EnvOpenAIClient() Client {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil
	}
	base := os.Getenv("OPENAI_BASE_URL")
	if base == "" {
		base = "https://api.openai.com/v1"
	}
	return NewOpenAIClient("openai", base, apiKey)
}
