package providers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

type anthropicClient struct {
	apiKey string
}

func NewAnthropicClient(apiKey string) Client {
	return &anthropicClient{apiKey: apiKey}
}

func (c *anthropicClient) Name() string { return "anthropic" }

func (c *anthropicClient) Classify(model, systemPrompt, userPrompt string) (Response, error) {
	body := map[string]any{
		"model": model,
		"system": systemPrompt,
		"max_tokens": 256,
		"temperature": 0,
		"messages": []map[string]any{{"role": "user", "content": userPrompt}},
	}
	bts, _ := json.Marshal(body)
	req, _ := http.NewRequest(http.MethodPost, "https://api.anthropic.com/v1/messages", bytes.NewReader(bts))
	req.Header.Set("content-type", "application/json")
	req.Header.Set("x-api-key", c.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	var res struct {
		Content []struct{
			Text string `json:"text"`
		} `json:"content"`
	}
	_ = json.Unmarshal(data, &res)
	content := ""
	if len(res.Content) > 0 {
		content = res.Content[0].Text
	}
	var js map[string]any
	_ = json.Unmarshal([]byte(content), &js)
	return Response{Raw: content, JSON: js}, nil
}
