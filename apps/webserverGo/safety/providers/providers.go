package providers

import "os"

func DefaultProvider() Client {
	name := os.Getenv("LLM_PROVIDER")
	if name == "" {
		name = "openai"
	}
	return ByName(name)
}

func ByName(p string) Client {
	switch p {
	case "openai":
		return EnvOpenAIClient()
	case "anthropic":
		key := os.Getenv("ANTHROPIC_API_KEY")
		if key == "" {
			return nil
		}
		return NewAnthropicClient(key)
	case "mistral":
		key := os.Getenv("MISTRAL_API_KEY")
		if key == "" {
			return nil
		}
		return NewMistralClient(key)
	case "huggingface":
		key := os.Getenv("HUGGINGFACE_API_KEY")
		if key == "" {
			return nil
		}
		return NewHFClient(key)
	case "groq":
		key := os.Getenv("GROQ_API_KEY")
		if key == "" {
			return nil
		}
		base := os.Getenv("GROQ_BASE_URL")
		if base == "" {
			base = "https://api.groq.com/openai/v1"
		}
		return NewOpenAIClient("groq", base, key)
	case "xai":
		key := os.Getenv("XAI_API_KEY")
		if key == "" {
			return nil
		}
		base := os.Getenv("XAI_BASE_URL")
		if base == "" {
			base = "https://api.x.ai/v1"
		}
		return NewOpenAIClient("xai", base, key)
	default:
		return nil
	}
}
