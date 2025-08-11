package providers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type mistralClient struct {
	apiKey string
}

func NewMistralClient(apiKey string) Client {
	return &mistralClient{apiKey: apiKey}
}

func (c *mistralClient) Name() string { return "mistral" }

func (c *mistralClient) Classify(model, systemPrompt, userPrompt string) (Response, error) {
	payload := map[string]any{
		"model": model,
		"response_format": map[string]any{"type": "json_object"},
		"temperature": 0,
		"messages": []map[string]any{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": userPrompt},
		},
	}
	bts, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "https://api.mistral.ai/v1/chat/completions", bytes.NewReader(bts))
	req.Header.Set("content-type", "application/json")
	req.Header.Set("authorization", "Bearer "+c.apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	var parsed struct {
		Choices []struct {
			Message struct{ Content string `json:"content"` } `json:"message"`
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
