import { GuildMember, Snowflake } from 'discord.js';
import DOMPurify, { Config } from 'isomorphic-dompurify';
import { type Browser, BrowserContext, chromium, type Page } from 'playwright';

import { Nullable } from '../Common/types';

import { Context } from './Context';

const PAGE_OPERATION_TIMEOUT = 5000;
const VALID_URL_PATTERN =
    /^https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net|i\.imgur\.com)\//;

export type TPlaywright = Playwright;

interface RenderData {
    attachments?: string | string[];
    avatar: string;
    content: string;
    replyAvatar?: string;
    replyContent?: string;
    replyUsername?: string;
    roleIcon?: string;
    timestamp: string;
    username: string;
}

interface RenderOptions {
    data: RenderData;
    deviceScaleFactor?: number;
    html: string;
    selector?: string;
    viewport?: {
        height: number;
        width: number;
    };
}

interface TemplateCache {
    browser: Nullable<Browser>;
    lastCleanup: number;
    maxPages: number;
    operationQueue: Promise<void>;
    pages: Array<{
        context: BrowserContext;
        lastUsed: number;
        page: Page;
    }>;
}

export default class Playwright {
    private static instance: Playwright;
    private sanitizerConfig: Config;
    private templateCache: TemplateCache;

    private constructor() {
        this.templateCache = {
            browser: null,
            lastCleanup: Date.now(),
            maxPages: 3,
            operationQueue: Promise.resolve(),
            pages: [],
        };
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

    public static getInstance(): Playwright {
        if (!Playwright.instance) {
            Playwright.instance = new Playwright();
        }
        return Playwright.instance;
    }

    public async cleanupCache(): Promise<void> {
        try {
            await this.cleanupOldPages();
            if (this.templateCache.browser) {
                await this.templateCache.browser.close();
                this.templateCache.browser = null;
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    public command(attribute: string): string {
        return `jsp-${attribute}`;
    }

    public async generateImage(options: RenderOptions): Promise<Buffer> {
        let context: BrowserContext | null = null;
        let page: null | Page = null;

        try {
            await this.ensureBrowserHealth();
            if (!this.templateCache.browser) {
                throw new Error('Browser not initialized');
            }

            context = await this.templateCache.browser.newContext({
                bypassCSP: true,
                deviceScaleFactor: options.deviceScaleFactor || 4,
                viewport: options.viewport || { height: 150, width: 480 },
            });

            page = await context.newPage();
            page.on('console', (msg) => console.log('Page log:', msg.text()));
            page.on('pageerror', (err) => console.error('Page error:', err));

            await page.addInitScript(() => {
                document.documentElement.style.backgroundColor = 'transparent';
                document.body.style.backgroundColor = 'transparent';
            });

            await page.setContent(options.html, {
                timeout: PAGE_OPERATION_TIMEOUT,
                waitUntil: 'networkidle',
            });

            await page.evaluate(() => document.fonts?.ready);
            const element = await page.$(options.selector || 'body');
            if (!element) throw new Error('Could not find target element');

            const boundingBox = await element.boundingBox();
            if (!boundingBox) throw new Error('Could not get element dimensions');

            await page.setViewportSize({
                height: Math.ceil(boundingBox.height),
                width: Math.max(520, Math.ceil(boundingBox.width)),
            });

            await page.evaluate(
                ({ data }: { data: RenderData }) => {
                    function framework(dom: Document, key: string, value): void {
                        const conditionalElements = dom.querySelectorAll(
                            `[data-exists-then-display="${key}"]`,
                        );
                        conditionalElements.forEach((element: HTMLElement) => {
                            const toggleClass = element.getAttribute('data-toggle-class');
                            if (!toggleClass) return;

                            const isEmpty =
                                value === undefined ||
                                value === null ||
                                (typeof value === 'string' && value.trim() === '');

                            if (isEmpty) {
                                element.classList.add(toggleClass);
                            } else {
                                element.classList.remove(toggleClass);
                            }
                        });

                        const elements = dom.querySelectorAll(`[data-bind="${key}"]`);
                        elements.forEach((element) => {
                            if (element instanceof HTMLImageElement) {
                                element.src = String(value);
                            } else if (element instanceof HTMLElement) {
                                if (
                                    typeof value === 'string' &&
                                    value.startsWith('<') &&
                                    value.endsWith('>')
                                ) {
                                    element.innerHTML = value;
                                } else {
                                    element.textContent = String(value);
                                }
                            }
                        });
                    }

                    return new Promise<void>((resolve) => {
                        Object.entries(data).forEach(([key, value]) => {
                            framework(document, key, value);
                        });

                        Promise.all(
                            Array.from(document.images).map((img) => {
                                if (img.complete) return Promise.resolve();
                                return new Promise((resolve) => {
                                    img.onload = resolve;
                                    img.onerror = resolve;
                                });
                            }),
                        ).then(() => resolve());
                    });
                },
                { data: options.data },
            );

            await page.evaluate(() => document.fonts?.ready);

            return (await element.screenshot({
                animations: 'disabled',
                omitBackground: false,
                scale: 'device',
                type: 'png',
            })) as Buffer;
        } catch (error) {
            console.error('Error generating image:', error);
            throw new Error(`Image generation failed: ${error.message}`);
        } finally {
            try {
                if (page) await page.close();
                if (context) await context.close();
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }
    }

    public isValidUrl(url: string): boolean {
        return VALID_URL_PATTERN.test(url);
    }

    public async parseMentions(
        ctx: Context,
        guildId: Snowflake,
        text: string[],
    ): Promise<string[]> {
        for (let i = 0; i < text.length; i++) {
            if (text[i].startsWith('<@')) {
                const userId = text[i].slice(2, -1);
                try {
                    const guild = await ctx.guilds.fetch(guildId);
                    const member = (await guild.members.fetch(userId)) as GuildMember;
                    if (member) {
                        const name = member.displayName || member.user.username;
                        text[i] = `<span class="mention" data-user-id="${name}">@${name}</span>`;
                    }
                } catch (error) {
                    console.error('Error fetching member:', error);
                    continue;
                }
            }
        }
        return text;
    }

    public sanitize(text: string): string {
        return DOMPurify.sanitize(text, this.sanitizerConfig);
    }

    private async cleanupOldPages(): Promise<void> {
        const now = Date.now();
        this.templateCache.lastCleanup = now;
        try {
            await Promise.all(this.templateCache.pages.map((p) => p.context.close()));
            this.templateCache.pages = [];
        } catch (error) {
            console.error('Error during page cleanup:', error);
        }
    }

    private async ensureBrowserHealth(): Promise<void> {
        if (!this.templateCache.browser) {
            await this.initializeCache();
            return;
        }
        try {
            const testContext = await this.templateCache.browser.newContext();
            await testContext.close();
        } catch (error) {
            console.error('Browser health check failed:', error);
            await this.initializeCache();
        }
    }

    private async initializeCache(retryCount = 0): Promise<void> {
        try {
            if (this.templateCache.browser) {
                await this.cleanupCache();
            }
            const browser = await chromium.launch({
                args: [
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--js-flags=--noexpose_wasm',
                    '--disable-background-networking',
                    '--disable-default-apps',
                    '--disable-extensions',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--metrics-recording-only',
                    '--mute-audio',
                    '--no-first-run',
                    '--safebrowsing-disable-auto-update',
                ],
            });
            this.templateCache.browser = browser;
        } catch (error) {
            console.error(`Failed to initialize browser (attempt ${retryCount + 1}):`, error);
            if (retryCount < 2) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.initializeCache(retryCount + 1);
            }
            throw error;
        }
    }
}
export const playwright = Playwright.getInstance();
