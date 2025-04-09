/* eslint @typescript-eslint/no-explicit-any: "off" */
import {
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
    AttachmentBuilder,
    Message,
} from 'discord.js';
import { Context } from '../Source/Context';
import { Listener } from './Listener';
import { Options } from '../Services/SettingsService';
import { defineEvent } from '../Common/define';
import DOMPurify from 'isomorphic-dompurify';
import type { Config as DOMPurifyConfig } from 'isomorphic-dompurify';
import { chromium, type Browser, type Page } from 'playwright';
import { Snowflake } from '@antibot/interactions';
const VALID_URL_PATTERN =
    /^https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net|i\.imgur\.com)\//;
const PAGE_OPERATION_TIMEOUT = 5000;
const sanitizerConfig: DOMPurifyConfig = {
    ALLOWED_TAGS: ['div', 'span', 'img'],
    ALLOWED_ATTR: ['class', 'src', 'alt', 'title'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
};

interface TemplateCache {
    html: string;
    browser: Browser | null;
    pages: Array<{
        page: Page;
        context: any;
        lastUsed: number;
    }>;
    maxPages: number;
    operationQueue: Promise<void>;
    lastCleanup: number;
}

function sanitize(text: string): string {
    return DOMPurify.sanitize(text, sanitizerConfig);
}

function isValidUrl(url: string): boolean {
    return VALID_URL_PATTERN.test(url);
}

async function parseMentions(ctx: Context, guildId: Snowflake, text: string[]): Promise<string[]> {
    for (let i = 0; i < text.length; i++) {
        if (text[i].startsWith('<@')) {
            const userId = text[i].slice(2, -1);
            const user = (await ctx.guilds.fetch(guildId)).members.fetch(userId);
            const name = (await (
                await user
            ).displayName)
                ? (await user).displayName
                : (await user).nickname || (await user).user.username;
            if (user) {
                if (text[i][1] === '!') {
                    text[i] = `<span class="mention" data-user-id="${name}">@${name}</span>`;
                } else {
                    text[i] = `<span class="mention" data-user-id="${name}">@${name}</span>`;
                }
            }
        }
    }

    return text;
}

export default class MessageReactionAddListener extends Listener<'messageReactionAdd'> {
    private templateCache: TemplateCache = {
        html: '',
        browser: null,
        pages: [],
        maxPages: 3,
        operationQueue: Promise.resolve(),
        lastCleanup: Date.now(),
    };
    private deviceScaleFactor: number;
    private html: string;

    constructor(ctx: Context) {
        super(ctx, 'messageReactionAdd');
        this.deviceScaleFactor = 4;
        this.html = `<!DOCTYPE html>
<html>
    <head>
        <style>
            @font-face {
                font-family: 'gg sans';
                src: url('${process.cwd().replace(/\\/g, '/')}/html/fonts/gg-sans-2(1)/gg sans Regular.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
            }

            @font-face {
                font-family: 'gg sans';
                src: url('${process.cwd().replace(/\\/g, '/')}/html/fonts/gg-sans-2(1)/gg sans Medium.ttf') format('truetype');
                font-weight: 500;
                font-style: normal;
            }

            @font-face {
                font-family: 'gg sans';
                src: url('${process.cwd().replace(/\\/g, '/')}/html/fonts/gg-sans-2(1)/gg sans Semibold.ttf') format('truetype');
                font-weight: 600;
                font-style: normal;
            }

            @font-face {
                font-family: 'gg sans';
                src: url('${process.cwd().replace(/\\/g, '/')}/html/fonts/gg-sans-2(1)/189422196a4f8b53 - gg sans bold.ttf') format('truetype');
                font-weight: bold;
                font-style: normal;
            }

            @font-face {
                font-family: 'gg sans';
                src: url('${process.cwd().replace(/\\/g, '/')}/html/fonts/gg-sans-2(1)/dd24010f3cf7def7 - gg sans italic.ttf') format('truetype');
                font-weight: normal;
                font-style: italic;
            }

            @font-face {
                font-family: 'gg sans';
                src: url('${process.cwd().replace(/\\/g, '/')}/html/fonts/gg-sans-2(1)/ce3b8055f5114434 - gg sans bold italic.ttf') format('truetype');
                font-weight: bold;
                font-style: italic;
            }

            body {
                margin: 0;
                font-family: 'gg sans', sans-serif;
                background-color: #313338;
                color: #dcddde;
            }

            .message-container {
                padding: 14px;
                width: 520px;
                margin-top: 24px;
                box-sizing: border-box;
                position: relative;
            }

            .message-wrapper {
                display: flex;
                align-items: flex-start;
                margin-top: -4px;
            }

            .no-reply .message-wrapper {
                margin-top: 0;
            }

            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 8px;
                object-fit: cover;
                flex-shrink: 0;
            }

            .message-content {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
            }

            .username-row {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 2px;
            }

            .username {
                font-weight: 600;
                color: #f2f3f5;
                font-size: 14px;
            }

            .message-time {
                top: 2px;
                color: #949ba4;
                font-size: 10px;
            }

            .icon {
                width: 16px;
                height: 16px;
            }

            .message-text {
                color: #dcddde;
                top: 3px;
                font-size: 13px;
                line-height: 15px;
            }

            .mention {
                color: #7289da;
                background-color: rgba(114,137,218,0.1);
                border-radius: 3px;
                padding: 0 2px;
            }

            .image-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                margin-top: 8px;
            }

            .image-container img {
                padding: 2px;
                width: 130px;
                height: 130px;
            }

            .reply-container {
                position: relative;
                display: inline;
                align-items: center;
                font-size: 13px;
                line-height: 16px;
                color: #b5bac1;
                margin-bottom: 5px;
                margin-left: 56px;
                padding-left: 8px;
            }

            .reply-container::before {
                content: '';
                position: absolute;
                top: 7px;
                left: -36px;
                width: 36px;
                height: 60%;
                border-left: 2px solid #4e5058;
                border-top: 2px solid #4e5058;
                border-top-left-radius: 6px;
                box-sizing: border-box;
                pointer-events: none;
            }

            .reply-avatar {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
                margin-left: -4px;
                margin-right: 6px;
            }

            .reply-message {
                display: inline;
                margin-left: -4px;

                flex-wrap: wrap;
                max-width: 400px;
                font-size: 12px;
                word-wrap: break-word;
            }

            .reply-username {
                font-weight: 600;
                margin-right: 4px;
                font-size: 12px;
            }

            .no-reply .reply-container {
                display: none;
            }
        </style>
    </head>
    <body>
        <div class="message-container">
            <div class="message-content no-reply">
                <div class="reply-container">
                    <img
                        class="reply-avatar"
                        src="https://cdn.discordapp.com/avatars/419958345487745035/a_4613f8763f6b3a1107b83c5497a606bd.gif?size=1024"
                        alt="reply-avatar"
                    />
                    <div class="reply-message">
                        <span class="reply-username">@AnotherUser</span>
                        <span>This is the replied message</span>
                    </div>
                </div>
                <div class="message-wrapper">
                    <img
                        class="avatar"
                        src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true"
                        alt="avatar"
                    />
                    <div>
                        <div class="username-row">
                            <span class="username">Username</span>
                            <img
                                class="icon"
                                src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true"
                                alt="icon"
                            />
                            <span class="message-time">Today at 12:34 PM</span>
                        </div>
                        <div class="message-text">Message text here</div>
                        <div class="image-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
`;
        this.initializeCache();
    }

    private async initializeCache(retryCount = 0) {
        try {
            if (this.templateCache.browser) {
                try {
                    await this.cleanupCache();
                } catch (error) {
                    console.error('Error cleaning up existing cache:', error);
                }
            }

            this.templateCache.html = this.html;
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

            for (let i = 0; i < this.templateCache.maxPages; i++) {
                const context = await browser.newContext({
                    viewport: {
                        width: 480,
                        height: 150,
                    },
                    deviceScaleFactor: this.deviceScaleFactor,
                });
                const page = await context.newPage();

                await page.route('**/*', (route) => {
                    const headers = { ...route.request().headers() };
                    if (route.request().resourceType() === 'document') {
                        headers['Content-Security-Policy'] =
                            "default-src 'self' cdn.discordapp.com media.discordapp.net i.imgur.com; img-src 'self' cdn.discordapp.com media.discordapp.net i.imgur.com; font-src 'self' data:";
                    }
                    return route.continue({ headers });
                });

                await Promise.race([
                    page.setContent(this.templateCache.html, {
                        waitUntil: 'networkidle',
                        timeout: PAGE_OPERATION_TIMEOUT,
                    }),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error('Page load timeout')),
                            PAGE_OPERATION_TIMEOUT,
                        ),
                    ),
                ]);

                this.templateCache.pages.push({ page, context, lastUsed: Date.now() });
            }
        } catch (error) {
            console.error(
                `Failed to initialize template cache (attempt ${retryCount + 1}):`,
                error,
            );
            if (retryCount < 2) {
                console.log('Retrying initialization...');
                await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.initializeCache(retryCount + 1);
            }
            throw error;
        }
    }

    private async queueOperation<T>(operation: () => Promise<T>): Promise<T> {
        const currentOperation = this.templateCache.operationQueue.then(() => operation());
        this.templateCache.operationQueue = currentOperation.then(() => {});
        return currentOperation;
    }

    private async ensureBrowserHealth() {
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

    private async generateMessageImage(
        username: string,
        nickname: string,
        content: string,
        timestamp: string,
        avatarUrl: string,
        roleColor: string,
        roleIconUrl: string,
        message: Message,
        repliedToMessage: Message | null,
        repliedToMember: any | null,
    ): Promise<Buffer> {
        await this.ensureBrowserHealth();

        if (Date.now() - this.templateCache.lastCleanup > 5 * 60 * 1000) {
            await this.cleanupOldPages();
        }

        const pageInfo = this.templateCache.pages.pop();
        let page = pageInfo?.page;
        if (!page && this.templateCache.browser) {
            page = await this.templateCache.browser.newPage();
        }
        if (!page) throw new Error('Failed to get a browser page');

        return this.queueOperation(async () => {
            try {
                let retries = 0;
                const maxRetries = 2;
                while (retries <= maxRetries) {
                    try {
                        await page.setContent(this.templateCache.html, {
                            waitUntil: 'networkidle',
                            timeout: PAGE_OPERATION_TIMEOUT,
                        });
                        break;
                    } catch (error) {
                        console.error(`Page setup failed (attempt ${retries + 1}):`, error);
                        if (retries === maxRetries) throw error;
                        retries++;
                        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
                    }
                }

                const sanitizedUsername = sanitize(username);
                const sanitizedNickname = sanitize(nickname);
                const parsedContent = (
                    await parseMentions(this.ctx, message.guild.id, content.split(' '))
                ).join(' ');
                const sanitizedContent = DOMPurify.sanitize(parsedContent, {
                    ...sanitizerConfig,
                    ALLOWED_TAGS: [...sanitizerConfig.ALLOWED_TAGS, 'span'],
                    ALLOWED_ATTR: [...sanitizerConfig.ALLOWED_ATTR, 'data-user-id'],
                });
                const sanitizedTimestamp = sanitize(timestamp);

                let parsedReplyContent = '';
                if (repliedToMessage && repliedToMessage.content) {
                    const parsedReplyArray = await parseMentions(
                        this.ctx,
                        repliedToMessage.guild.id,
                        repliedToMessage.content.split(' '),
                    );
                    parsedReplyContent = sanitize(parsedReplyArray.join(' '));
                }

                type MessageData = {
                    username: string;
                    nickname: string;
                    content: string;
                    timestamp: string;
                    avatarUrl: string;
                    roleColor: string;
                    roleIconUrl: string;
                    attachments: string[];
                    reply: {
                        username: string;
                        content: string;
                        avatarUrl: string;
                        roleColor: string;
                        member: any;
                    } | null;
                };

                await page.evaluate(
                    (data: MessageData) => {
                        return new Promise<boolean>((resolve, reject) => {
                            let totalImageCount = 2;
                            let loadedImageCount = 0;
                            const usernameEl: HTMLElement = document.querySelector('.username');
                            const messageEl: HTMLElement = document.querySelector('.message-text');
                            const timeEl: HTMLElement = document.querySelector('.message-time');
                            const avatarEl: HTMLImageElement = document.querySelector('.avatar');
                            const roleIconEl: HTMLImageElement = document.querySelector('.icon');
                            const imageContainer: HTMLElement =
                                document.querySelector('.image-container');

                            if (
                                !usernameEl ||
                                !messageEl ||
                                !timeEl ||
                                !avatarEl ||
                                !roleIconEl ||
                                !imageContainer
                            ) {
                                reject(new Error('Required elements not found in template'));
                                return;
                            }

                            const onImageLoad = () => {
                                loadedImageCount++;
                                if (loadedImageCount === totalImageCount) {
                                    resolve(true);
                                }
                            };

                            const onImageError = (e: ErrorEvent) => {
                                console.error('Failed to load image:', e);
                                loadedImageCount++;
                                if (loadedImageCount === totalImageCount) {
                                    resolve(true);
                                }
                            };

                            avatarEl.onload = onImageLoad;
                            avatarEl.onerror = onImageError;
                            roleIconEl.onload = onImageLoad;
                            roleIconEl.onerror = onImageError;

                            usernameEl.textContent = `${data.username} (${data.nickname})`;
                            usernameEl.style.color = data.roleColor;
                            messageEl.innerHTML = data.content;
                            timeEl.textContent = 'Today at ' + data.timestamp;

                            avatarEl.src = data.avatarUrl;
                            roleIconEl.src = data.roleIconUrl;

                            if (data.reply) {
                                const replyContainer: HTMLElement =
                                    document.querySelector('.reply-container');
                                const replyAvatarEl: HTMLImageElement =
                                    document.querySelector('.reply-avatar');
                                const replyUsernameEl: HTMLElement =
                                    document.querySelector('.reply-username');
                                const messageContainer: HTMLElement =
                                    document.querySelector('.message-container');

                                if (replyContainer && replyUsernameEl && replyAvatarEl) {
                                    messageContainer.classList.remove('no-reply');
                                    replyContainer.style.display = 'block';

                                    replyAvatarEl.onload = onImageLoad;
                                    replyAvatarEl.onerror = onImageError;
                                    totalImageCount++;

                                    setTimeout(() => {
                                        replyAvatarEl.src = data.reply.avatarUrl;
                                    }, 0);
                                    replyUsernameEl.textContent = `@${data.reply.username}`;
                                    const replyColor = data.reply.roleColor || '#FFFFFF';
                                    replyUsernameEl.style.color = replyColor;

                                    const range = document.createRange();
                                    range.selectNodeContents(replyContainer);
                                    range.setStartAfter(replyUsernameEl);
                                    range.deleteContents();

                                    replyContainer.innerHTML += data.reply.content;
                                }
                            }

                            if (data.attachments.length > 0) {
                                imageContainer.style.display = 'grid';
                                const imageElements: HTMLImageElement[] = [];
                                data.attachments.forEach((attachment) => {
                                    const img = document.createElement('img');
                                    img.onload = onImageLoad;
                                    img.onerror = onImageError;
                                    setTimeout(() => {
                                        img.src = attachment;
                                    }, 0);
                                    img.alt = 'attachment';
                                    imageElements.push(img);
                                    totalImageCount++;
                                });
                                imageElements.forEach((img) => imageContainer.appendChild(img));
                            } else {
                                imageContainer.style.display = 'none';
                                imageContainer.innerHTML = '';
                            }
                        });
                    },
                    {
                        username: sanitizedUsername,
                        nickname: sanitizedNickname,
                        content: sanitizedContent,
                        timestamp: sanitizedTimestamp,
                        avatarUrl,
                        roleColor,
                        roleIconUrl,
                        attachments: Array.from(message.attachments.values()).map((a) => a.url),
                        reply:
                            repliedToMessage && repliedToMember
                                ? {
                                      username: repliedToMessage.author.username,
                                      content: parsedReplyContent,
                                      avatarUrl: repliedToMessage.author.displayAvatarURL(),
                                      member: repliedToMember,
                                      roleColor: (() => {
                                          const roleColor =
                                              repliedToMember.roles.cache
                                                  .filter((role) => role.color !== 0)
                                                  .sort((a, b) => b.position - a.position)
                                                  .first()?.hexColor || '#FFFFFF';
                                          return roleColor;
                                      })(),
                                  }
                                : null,
                    },
                );

                const messageContainer = await page.$('.message-container');
                if (!messageContainer) {
                    throw new Error('Could not find message container');
                }

                await page.evaluate(() => {
                    document.body.style.background = '#36393f';
                    document.body.style.margin = '0';
                    document.body.style.padding = '0';
                });

                const buffer = (await messageContainer.screenshot({
                    type: 'png',
                    omitBackground: false,
                })) as Buffer;

                return buffer;
            } catch (error) {
                console.error('Error during page operations:', error);
                throw error;
            } finally {
                if (this.templateCache.pages.length < this.templateCache.maxPages) {
                    const context = page.context();
                    this.templateCache.pages.push({ page, context, lastUsed: Date.now() });
                } else {
                    await page.close();
                }
            }
        });
    }

    private async cleanupOldPages(): Promise<void> {
        const now = Date.now();
        this.templateCache.lastCleanup = now;
        const FIVE_MINUTES = 5 * 60 * 1000;

        try {
            if (this.templateCache.pages.length > this.templateCache.maxPages * 2) {
                console.warn('Too many pages open, forcing cleanup');
                const pagesToRemove = this.templateCache.pages.slice(this.templateCache.maxPages);
                await Promise.all(pagesToRemove.map((p) => p.page.close()));
                this.templateCache.pages = this.templateCache.pages.slice(
                    0,
                    this.templateCache.maxPages,
                );
                return;
            }

            const oldPages = this.templateCache.pages.filter(
                (p) => now - p.lastUsed > FIVE_MINUTES,
            );
            await Promise.all(
                oldPages.map(async (p) => {
                    try {
                        await p.context.clearCookies();
                        await p.page.close();
                        await p.context.close();
                    } catch (error) {
                        console.error('Error cleaning up page:', error);
                    }
                }),
            );

            this.templateCache.pages = this.templateCache.pages.filter(
                (p) => now - p.lastUsed <= FIVE_MINUTES,
            );

            if (this.templateCache.browser) {
                if (this.templateCache.pages.length > this.templateCache.maxPages * 3) {
                    console.warn('Browser has too many pages, restarting...');
                    await this.cleanupCache();
                    await this.initializeCache();
                }
            }
        } catch (error) {
            console.error('Error during page cleanup:', error);
        }
    }

    private async cleanupCache(): Promise<void> {
        try {
            await Promise.all(
                this.templateCache.pages.map(async (pageInfo) => {
                    try {
                        await pageInfo.page.close();
                    } catch (error) {
                        console.error('Error closing page:', error);
                    }
                }),
            );
            this.templateCache.pages = [];

            if (this.templateCache.browser) {
                await this.templateCache.browser.close();
                this.templateCache.browser = null;
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    public async onUnload(): Promise<void> {
        await this.cleanupCache();
    }

    public async execute(reaction: MessageReaction | PartialMessageReaction): Promise<void> {
        try {
            const guildId = reaction.message.guildId!;
            await this.ctx.services.settings.configure<Options>({ guildId });
            const { Skullboard } = this.ctx.services.settings.getSettings();

            if (
                reaction.emoji.name === Skullboard.SkullboardEmoji &&
                reaction.count >= Skullboard.SkullboardReactionThreshold
            ) {
                const skullboardChannel = this.ctx.channels.resolve(
                    Skullboard.SkullboardChannel,
                ) as TextChannel;
                const fetchedChannel = await this.ctx.channels.fetch(reaction.message.channel.id);

                if (fetchedChannel?.isTextBased()) {
                    const message = await fetchedChannel.messages.fetch(reaction.message.id);
                    const member = message.guild.members.resolve(message.author.id);

                    try {
                        const timestamp = new Date(message.createdTimestamp).toLocaleTimeString(
                            'en-US',
                            { hour: 'numeric', minute: '2-digit', hour12: true },
                        );

                        const repliedToMessage = message.reference
                            ? await message.channel.messages.fetch(message.reference.messageId)
                            : null;

                        const repliedToMember = repliedToMessage
                            ? await message.guild.members.fetch(repliedToMessage.author.id)
                            : null;

                        const coloredRole =
                            member.roles.cache
                                .filter((role) => role.color !== 0)
                                .sort((a, b) => b.position - a.position)
                                .first() || '#FFFFFF';

                        const avatarUrl = member.user.displayAvatarURL({
                            forceStatic: true,
                            size: 1024,
                        });
                        const roleIconUrl =
                            member.roles.highest.iconURL() || message.guild.iconURL();

                        if (!isValidUrl(avatarUrl) || (roleIconUrl && !isValidUrl(roleIconUrl))) {
                            throw new Error('Invalid avatar or role icon URL');
                        }

                        const imageBuffer = await this.generateMessageImage(
                            sanitize(message.member.nickname || message.author?.globalName || ''),
                            sanitize(message.author?.username || 'Unknown User'),
                            message.content || '',
                            sanitize(timestamp),
                            member.user.displayAvatarURL({
                                forceStatic: true,
                                size: 1024,
                            }),
                            typeof coloredRole === 'string'
                                ? coloredRole
                                : String(coloredRole.hexColor),
                            roleIconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                            message,
                            repliedToMessage,
                            repliedToMember,
                        );

                        const attachment = new AttachmentBuilder(imageBuffer, {
                            name: 'screenshot.png',
                        });
                        await skullboardChannel.send({
                            files: [attachment],
                            embeds: [
                                {
                                    title: `${message.author?.username} (${message.author?.id})`,
                                    image: {
                                        url: 'attachment://screenshot.png',
                                    },
                                    fields: [
                                        {
                                            name: 'Author',
                                            value: `<@${message.author?.id}>`,
                                            inline: true,
                                        },
                                    ],
                                    color: global.embedColor,
                                    timestamp: new Date().toISOString(),
                                },
                            ],
                        });
                    } catch (error) {
                        console.error('Error generating message image:', error);
                        await skullboardChannel.send({
                            embeds: [
                                {
                                    title: `${message.author?.username} (${message.author?.id})`,
                                    description: `${message.content}`,
                                    fields: [
                                        {
                                            name: 'Author',
                                            value: `<@${message.author?.id}>`,
                                            inline: true,
                                        },
                                        {
                                            name: 'Channel',
                                            value: `<#${message.channel.id}>`,
                                            inline: true,
                                        },
                                        {
                                            name: 'Message Link',
                                            value: `[Jump to message](https://discord.com/channels/${message.guildId}/${message.channel.id}/${message.id})`,
                                            inline: true,
                                        },
                                    ],
                                    color: global.embedColor,
                                    timestamp: new Date().toISOString(),
                                },
                            ],
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in execute:', error);
            if (this.templateCache.browser) {
                try {
                    await this.cleanupCache();
                    await this.initializeCache();
                } catch (cleanupError) {
                    console.error('Error during cleanup after failure:', cleanupError);
                }
            }
        }
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: (reaction: MessageReaction | PartialMessageReaction) => {
                const user = reaction.message.author;
                if (!user) return;
                return this.execute(reaction);
            },
        });
    }
}
