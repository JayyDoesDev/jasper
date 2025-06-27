import {
    AttachmentBuilder,
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
} from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { Options } from '../services/settingsService';

import { Listener } from './listener';

interface PlaywrightRenderRequest {
    [key: string]: unknown;
    attachments?: null | string[];
    avatar: string;
    channelId: string;
    channelName: string;
    content: string;
    customData?: {
        mentionedRoles: Record<string, string>;
        mentionedUsers: Record<string, string>;
    };
    replyAvatar?: string;
    replyContent?: string;
    replyUsername?: string;
    replyUsernameColor?: string;
    roleIcon: string;
    roleId: null | string;
    roleName: string;
    timestamp: string;
    userId: string;
    username: string;
    usernameColor: string;
}

export default class MessageReactionAddListener extends Listener<'messageReactionAdd'> {
    constructor(ctx: Context) {
        super(ctx, 'messageReactionAdd');
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
                            !this.ctx.webserver.isValidUrl(avatarUrl) ||
                            (roleIconUrl && !this.ctx.webserver.isValidUrl(roleIconUrl))
                        ) {
                            throw new Error('Invalid avatar or role icon URL');
                        }

                        const attachmentUrls = Array.from(message.attachments.values())
                            .filter((attachment) => attachment.url)
                            .map(
                                (attachment) => attachment.url,
                            );

                        // Get mentioned users info
                        const mentionedUsers = new Map<string, string>();
                        message.mentions.users.forEach((user) => {
                            mentionedUsers.set(user.id, user.username);
                        });

                        // Prepare mentioned roles info
                        const mentionedRoles = new Map<string, string>();
                        message.mentions.roles.forEach((role) => {
                            mentionedRoles.set(role.id, role.name);
                        });

                        const response = await this.ctx.webserver.request<PlaywrightRenderRequest>(
                            'POST',
                            '/fun/skullboard',
                            {
                                attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
                                avatar: member.user.displayAvatarURL({
                                    forceStatic: true,
                                    size: 1024,
                                }),
                                channelId: message.channel.id,
                                channelName:
                                    message.channel.isTextBased() && 'name' in message.channel
                                        ? message.channel.name
                                        : 'channel',
                                content: message.content || '',
                                customData: {
                                    mentionedRoles: Object.fromEntries(mentionedRoles),
                                    mentionedUsers: Object.fromEntries(mentionedUsers),
                                },
                                roleIcon:
                                    roleIconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                                roleId: typeof coloredRole === 'string' ? null : coloredRole.id,
                                roleName:
                                    typeof coloredRole === 'string' ? 'Role' : coloredRole.name,
                                timestamp: this.ctx.webserver.sanitize(timestamp),
                                userId: message.author?.id,
                                username:
                                    this.ctx.webserver.sanitize(
                                        message.author?.username || 'Unknown User',
                                    ) +
                                    (message.member && message.member.nickname
                                        ? ` (${this.ctx.webserver.sanitize(
                                              message.member.nickname ||
                                                  message.author?.globalName ||
                                                  '',
                                          )})`
                                        : ''),
                                usernameColor:
                                    typeof coloredRole === 'string'
                                        ? coloredRole
                                        : coloredRole.hexColor,
                                ...(repliedToMessage && repliedToMember
                                    ? {
                                          replyAvatar: repliedToMessage.author.displayAvatarURL(),
                                          replyContent: repliedToMessage.content || '',
                                          replyUsername:
                                              '@' +
                                              this.ctx.webserver.sanitize(
                                                  repliedToMember.user.username || 'Unknown User',
                                              ),
                                          replyUsernameColor:
                                              typeof repliedColorRole === 'string'
                                                  ? repliedColorRole
                                                  : repliedColorRole.hexColor,
                                      }
                                    : {}),
                            },
                            true,
                        );

                        if (!response.ok) {
                            throw new Error(
                                `Failed to generate image: ${response.status} ${response.statusText}`,
                            );
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
