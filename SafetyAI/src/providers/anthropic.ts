import { request } from 'undici';
import { LLMClient, LLMResponse } from './index.js';

export class AnthropicClient implements LLMClient {
  constructor(private apiKey: string) {}
  name() { return 'anthropic'; }

  async classify(opts: { model: string; system: string; user: string }): Promise<LLMResponse> {
    const url = 'https://api.anthropic.com/v1/messages';
    const body = {
      model: opts.model,
      system: opts.system,
      max_tokens: 256,
      temperature: 0,
      messages: [
        { role: 'user', content: opts.user }
      ]
    };
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    const data = await res.body.json() as any;
    const content = data?.content?.[0]?.text ?? '';
    let json: any | undefined;
    try { json = JSON.parse(content); } catch {}
    return { raw: content, json };
  }
}
