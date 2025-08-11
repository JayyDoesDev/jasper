package providers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
)

type hfClient struct {
	apiKey string
}

func NewHFClient(apiKey string) Client {
	return &hfClient{apiKey: apiKey}
}

func (c *hfClient) Name() string { return "huggingface" }

func (c *hfClient) Classify(model, systemPrompt, userPrompt string) (Response, error) {
	endpoint := "https://api-inference.huggingface.co/models/" + url.PathEscape(model)
	prompt := systemPrompt + "\n\nUser:\n" + userPrompt + "\n\nReturn ONLY a compact JSON object."
	payload := map[string]any{
		"inputs": prompt,
		"parameters": map[string]any{
			"max_new_tokens": 300,
			"temperature": 0,
			"return_full_text": false,
		},
	}
	bts, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(bts))
	req.Header.Set("authorization", "Bearer "+c.apiKey)
	req.Header.Set("content-type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return Response{}, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)

	var arr []map[string]any
	_ = json.Unmarshal(data, &arr)
	var text string
	if len(arr) > 0 {
		if s, ok := arr[0]["generated_text"].(string); ok {
			text = s
		}
	}
	if text == "" {
		// fallback to raw data
		_ = json.Unmarshal(data, &text)
	}
	var js map[string]any
	_ = json.Unmarshal([]byte(text), &js)
	return Response{Raw: text, JSON: js}, nil
}
