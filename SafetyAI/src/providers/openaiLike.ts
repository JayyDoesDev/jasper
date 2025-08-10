import { request } from 'undici';
import { LLMClient, LLMResponse } from './index.js';

export class OpenAILikeClient implements LLMClient {
  constructor(
    private providerName: string,
    private baseUrl: string,
    private apiKey: string
  ) {}

  name() { return this.providerName; }

  async classify(opts: { model: string; system: string; user: string }): Promise<LLMResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const body = {
      model: opts.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user }
      ],
      temperature: 0
    };
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    const data = await res.body.json() as any;
    const content = data?.choices?.[0]?.message?.content ?? '';
    let json: any | undefined;
    try { json = JSON.parse(content); } catch {}
    return { raw: content, json };
  }
}
