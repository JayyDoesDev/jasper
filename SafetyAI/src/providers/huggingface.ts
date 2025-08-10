import { request } from 'undici';
import { LLMClient, LLMResponse } from './index.js';

export class HuggingFaceClient implements LLMClient {
  constructor(private apiKey: string) {}
  name() { return 'huggingface'; }

  async classify(opts: { model: string; system: string; user: string }): Promise<LLMResponse> {
    const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(opts.model)}`;
    const prompt = `${opts.system}\n\nUser:\n${opts.user}\n\nReturn ONLY a compact JSON object.`;
    const body = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0,
        return_full_text: false
      }
    };
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'authorization': `Bearer ${this.apiKey}`,
        'content-type': 'application/json'
      }
    });
    const data = await res.body.json() as any;
    const text = Array.isArray(data) ? (data[0]?.generated_text ?? '') : (data?.generated_text ?? JSON.stringify(data));
    let json: any | undefined;
    try { json = JSON.parse(text); } catch {}
    return { raw: text, json };
  }
}
