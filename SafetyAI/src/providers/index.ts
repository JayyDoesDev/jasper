import { OpenAILikeClient } from './openaiLike.js';
import { AnthropicClient } from './anthropic.js';
import { MistralClient } from './mistral.js';
import { HuggingFaceClient } from './huggingface.js';
import { ENV } from '../config.js';

export interface LLMResponse {
  raw: string;
  json?: any;
}

export interface LLMClient {
  name(): string;
  classify(opts: { model: string; system: string; user: string }): Promise<LLMResponse>;
}

export function getClient(provider: string): LLMClient {
  switch (provider) {
    case 'openai':
      return new OpenAILikeClient('openai', ENV.OPENAI_BASE_URL, ENV.OPENAI_API_KEY!);
    case 'groq':
      return new OpenAILikeClient('groq', ENV.GROQ_BASE_URL, ENV.GROQ_API_KEY!);
    case 'xai':
      return new OpenAILikeClient('xai', ENV.XAI_BASE_URL, ENV.XAI_API_KEY!);
    case 'anthropic':
      return new AnthropicClient(ENV.ANTHROPIC_API_KEY!);
    case 'mistral':
      return new MistralClient(ENV.MISTRAL_API_KEY!);
    case 'huggingface':
      return new HuggingFaceClient(ENV.HUGGINGFACE_API_KEY!);
    case 'huggingface_router':
    case 'hf_router':
      return new OpenAILikeClient('huggingface_router', 'https://router.huggingface.co/v1', ENV.HUGGINGFACE_API_KEY!);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
