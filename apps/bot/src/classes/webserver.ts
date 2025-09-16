/* eslint @typescript-eslint/no-explicit-any: "off" */
import DOMPurify, { Config } from 'isomorphic-dompurify';

import { Context } from './context';

const VALID_URL_PATTERN =
    /^https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net|i\.imgur\.com)\//;

export default class WebServer {
    private ctx: Context;
    private sanitizerConfig: Config;

    public constructor(ctx: Context) {
        this.ctx = ctx;
        this.sanitizerConfig = {
            ALLOW_ARIA_ATTR: false,
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            ALLOWED_ATTR: ['class', 'src', 'alt', 'title'],
            ALLOWED_TAGS: ['div', 'span', 'img'],
            FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'],
            SAFE_FOR_TEMPLATES: true,
        };
    }

    public isValidUrl(url: string): boolean {
        return VALID_URL_PATTERN.test(url);
    }

    public async request<Body extends Record<string, unknown>>(
        method: string,
        route: string,
        body?: Body,
        raw?: boolean,
    ): Promise<any> {
        const response = await fetch(`${this.ctx.env.get('jasper_api_url')}${route}`, {
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                'Content-Type': 'application/json',
                'JASPER-API-KEY': this.ctx.env.get('jasper_api_key') || '',
            },
            method,
        });

        if (raw) return response;

        const contentType = response.headers.get('Content-Type') || '';

        if (response.status === 204 || !contentType.includes('application/json')) {
            return null;
        }

        try {
            return await response.json();
        } catch (err) {
            console.error('Failed to parse JSON:', err);
            return null;
        }
    }

    public sanitize(text: string): string {
        return DOMPurify.sanitize(text, this.sanitizerConfig);
    }
}
