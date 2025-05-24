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

                        const content = message.content || '';
                        const parsedContent = (
                            await this.playwright.parseMentions(
                                this.ctx,
                                message.guild.id,
                                content.split(' '),
                            )
                        ).join(' ');

                        let parsedReplyContent = '';
                        if (repliedToMessage?.content) {
                            const parsedReplyArray = await this.playwright.parseMentions(
                                this.ctx,
                                repliedToMessage.guild.id,
                                repliedToMessage.content.split(' '),
                            );
                            parsedReplyContent = parsedReplyArray.join(' ');
                        }

                        const attachmentHtml = [];
                        if (message.attachments.size > 0) {
                            message.attachments.forEach((attachment) => {
                                if (attachment.url) {
                                    attachmentHtml.push(`<img src="${attachment.url}" alt="attachment" />`);
                                }
                            });
                        }

                        const response = await fetch('http://localhost:8080/playwright/render', {
                            body: JSON.stringify({
                                attachments: attachmentHtml.length > 0 ? attachmentHtml.join('\n') : null,
                                avatar: member.user.displayAvatarURL({
                                    forceStatic: true,
                                    size: 1024,
                                }),
                                content: parsedContent,
                                roleIcon:
                                    roleIconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                                timestamp: this.playwright.sanitize(timestamp),
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
                                          replyContent: parsedReplyContent,
                                          replyUsername: '@' + this.playwright.sanitize(repliedToMember.user.username || 'Unknown User'),
                                          replyUsernameColor: typeof repliedColorRole === 'string' ? repliedColorRole : repliedColorRole.hexColor
                                      }
                                    : {}),
                            }),
                            headers: {
                                'Content-Type': 'application/json',
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
