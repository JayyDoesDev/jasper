import {
    AttachmentBuilder,
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
} from 'discord.js';

import { Context } from '../classes/context';
import Playwright from '../classes/playwright';
import { defineEvent } from '../define';
import { Options } from '../services/settingsService';

import { Listener } from './listener';

export default class MessageReactionAddListener extends Listener<'messageReactionAdd'> {
    private playwright: Playwright;
    constructor(ctx: Context) {
        super(ctx, 'messageReactionAdd');
        this.playwright = new Playwright();
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
                    if (!member) {
                        throw new Error('Could not resolve message author as guild member');
                    }

                    try {
                        const timestamp = new Date(message.createdTimestamp).toLocaleTimeString(
                            'en-US',
                            { hour: 'numeric', hour12: true, minute: '2-digit' },
                        );

                        const repliedToMessage = message.reference
                            ? await message.channel.messages.fetch(message.reference.messageId)
                            : null;

                        const repliedToMember = repliedToMessage
                            ? await message.guild.members
                                  .fetch(repliedToMessage.author.id)
                                  .catch(() => null)
                            : null;

                        const coloredRole =
                            member?.roles?.cache
                                ?.filter((role) => role.color !== 0)
                                ?.sort((a, b) => b.position - a.position)
                                ?.first() || '#FFFFFF';

                        const repliedColorRole =
                            repliedToMember?.roles?.cache
                                ?.filter((role) => role.color !== 0)
                                ?.sort((a, b) => b.position - a.position)
                                ?.first() || '#FFFFFF';

                        const avatarUrl = member.user.displayAvatarURL({
                            forceStatic: true,
                            size: 1024,
                        });
                        const roleIconUrl =
                            member?.roles?.highest?.iconURL() || message.guild.iconURL();

                        if (
                            !this.playwright.isValidUrl(avatarUrl) ||
                            (roleIconUrl && !this.playwright.isValidUrl(roleIconUrl))
                        ) {
                            throw new Error('Invalid avatar or role icon URL');
                        }

                        const attachmentUrls = Array.from(message.attachments.values())
                            .filter(attachment => attachment.url)
                            .map(attachment => `<img src="${attachment.url}" alt="attachment" />`);

                        // Get mentioned users info
                        const mentionedUsers = new Map<string, string>();
                        message.mentions.users.forEach(user => {
                            mentionedUsers.set(user.id, user.username);
                        });

                        // Prepare mentioned roles info
                        const mentionedRoles = new Map<string, string>();
                        message.mentions.roles.forEach(role => {
                            mentionedRoles.set(role.id, role.name);
                        });

                        const response = await fetch('http://localhost:8080/playwright/render', {
                            body: JSON.stringify({
                                attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
                                avatar: member.user.displayAvatarURL({
                                    forceStatic: true,
                                    size: 1024,
                                }),
                                channelId: message.channel.id,
                                channelName: message.channel.isTextBased() && 'name' in message.channel ? message.channel.name : 'channel',
                                content: message.content || '',
                                customData: {
                                    mentionedRoles: Object.fromEntries(mentionedRoles),
                                    mentionedUsers: Object.fromEntries(mentionedUsers)
                                },
                                roleIcon: roleIconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                                roleId: typeof coloredRole === 'string' ? null : coloredRole.id,
                                roleName: typeof coloredRole === 'string' ? 'Role' : coloredRole.name,
                                timestamp: this.playwright.sanitize(timestamp),
                                userId: message.author?.id,
                                username: this.playwright.sanitize(message.author?.username || 'Unknown User') +
                                    (message.member
                                        ? ` (${this.playwright.sanitize(
                                              message.member.nickname ||
                                                  message.author?.globalName ||
                                                  '',
                                          )})`
                                        : ''
                                    ),
                                usernameColor: typeof coloredRole === 'string' ? coloredRole : coloredRole.hexColor,
                                ...(repliedToMessage && repliedToMember
                                    ? {
                                          replyAvatar: repliedToMessage.author.displayAvatarURL(),
                                          replyContent: repliedToMessage.content || '',
                                          replyUsername: '@' + this.playwright.sanitize(repliedToMember.user.username || 'Unknown User'),
                                          replyUsernameColor: typeof repliedColorRole === 'string' ? repliedColorRole : repliedColorRole.hexColor
                                      }
                                    : {}),
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                                'JASPER-API-KEY': this.ctx.env.get('jasper_api_key'),
                            },
                            method: 'POST',
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const buffer = await response.arrayBuffer();
                        const imageBuffer = Buffer.from(buffer);

                        const attachment = new AttachmentBuilder(imageBuffer, {
                            name: 'screenshot.png',
                        });
                        await skullboardChannel.send({
                            embeds: [
                                {
                                    color: global.embedColor,
                                    fields: [
                                        {
                                            inline: true,
                                            name: 'Author',
                                            value: `<@${message.author?.id}>`,
                                        },
                                    ],
                                    image: {
                                        url: 'attachment://screenshot.png',
                                    },
                                    timestamp: new Date().toISOString(),
                                    title: `${message.author?.username} (${message.author?.id})`,
                                },
                            ],
                            files: [attachment],
                        });
                    } catch (error) {
                        console.error('Error generating message image:', error);
                        await skullboardChannel.send({
                            embeds: [
                                {
                                    color: global.embedColor,
                                    description: `${message.content}`,
                                    fields: [
                                        {
                                            inline: true,
                                            name: 'Author',
                                            value: `<@${message.author?.id}>`,
                                        },
                                        {
                                            inline: true,
                                            name: 'Channel',
                                            value: `<#${message.channel.id}>`,
                                        },
                                        {
                                            inline: true,
                                            name: 'Message Link',
                                            value: `[Jump to message](https://discord.com/channels/${message.guildId}/${message.channel.id}/${message.id})`,
                                        },
                                    ],
                                    timestamp: new Date().toISOString(),
                                    title: `${message.author?.username} (${message.author?.id})`,
                                },
                            ],
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in execute:', error);
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
