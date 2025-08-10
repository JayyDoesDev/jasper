import { request } from 'undici';
import { LLMClient, LLMResponse } from './index.js';

export class MistralClient implements LLMClient {
  constructor(private apiKey: string) {}
  name() { return 'mistral'; }

  async classify(opts: { model: string; system: string; user: string }): Promise<LLMResponse> {
    const url = 'https://api.mistral.ai/v1/chat/completions';
    const body = {
      model: opts.model,
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user }
      ]
    };
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${this.apiKey}`
      }
    });
    const data = await res.body.json() as any;
    const content = data?.choices?.[0]?.message?.content ?? '';
    let json: any | undefined;
    try { json = JSON.parse(content); } catch {}
    return { raw: content, json };
  }
}
