import { GuildMember, Snowflake } from 'discord.js';
import DOMPurify, { Config } from 'isomorphic-dompurify';

import { Context } from './context';

const VALID_URL_PATTERN =
    /^https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net|i\.imgur\.com)\//;

export default class Playwright {
    private sanitizerConfig: Config;

    public constructor() {
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
 
}
