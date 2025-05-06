import {
    AttachmentBuilder,
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
} from 'discord.js';

import { defineEvent } from '../Common/define';
import { Options } from '../Services/SettingsService';
import { Context } from '../Source/Context';
import { playwright } from '../Source/Playwright';

import { Listener } from './Listener';

export default class MessageReactionAddListener extends Listener<'messageReactionAdd'> {
    private messageTemplate: string;

    constructor(ctx: Context) {
        super(ctx, 'messageReactionAdd');
        this.messageTemplate = `<!DOCTYPE html>
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
                min-width: 520px;
                max-width: 800px;
                width: fit-content;
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
                flex-wrap: wrap;
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
                line-height: 18px;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow-wrap: break-word;
                max-width: 760px;
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

.message-content.no-reply .reply-container {
    display: none;
}

        </style>
    </head>
    <body>
<div class="message-container">
  <div
    class="message-content"
    data-exists-then-display="replyContent"
    data-toggle-class="no-reply"
  >
                <div class="reply-container">
                    <img
                        class="reply-avatar"
                        src="https://cdn.discordapp.com/avatars/419958345487745035/a_4613f8763f6b3a1107b83c5497a606bd.gif?size=1024"
                        alt="reply-avatar"
                        data-bind="replyAvatar"
                    />
                    <div class="reply-message">
                        <span class="reply-username" data-bind="replyUsername">@AnotherUser</span>
                        <span data-bind="replyContent">This is the replied message</span>
                    </div>
                </div>
                <div class="message-wrapper">
                    <img
                        class="avatar"
                        src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true"
                        alt="avatar"
                        data-bind="avatar"
                    />
                    <div>
                        <div class="username-row">
                            <span class="username" data-bind="username">Username</span>
                            <img
                                class="icon"
                                src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true"
                                alt="icon"
                                data-bind="roleIcon"
                            />
                            <span class="message-time" data-bind="timestamp">Today at 12:34 PM</span>
                        </div>
                        <div class="message-text" data-bind="content">Message text here</div>
                        <div class="image-container" data-bind="attachments"></div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>`;
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
                            !playwright.isValidUrl(avatarUrl) ||
                            (roleIconUrl && !playwright.isValidUrl(roleIconUrl))
                        ) {
                            throw new Error('Invalid avatar or role icon URL');
                        }

                        const content = message.content || '';
                        const parsedContent = (
                            await playwright.parseMentions(
                                this.ctx,
                                message.guild.id,
                                content.split(' '),
                            )
                        ).join(' ');

                        let parsedReplyContent = '';
                        if (repliedToMessage?.content) {
                            const parsedReplyArray = await playwright.parseMentions(
                                this.ctx,
                                repliedToMessage.guild.id,
                                repliedToMessage.content.split(' '),
                            );
                            parsedReplyContent = parsedReplyArray.join(' ');
                        }

                        const images = [];
                        if (message.attachments.size > 0) {
                            message.attachments.forEach((attachment) => {
                                if (attachment.url) {
                                    images.push(`<img src="${attachment.url}" alt="attachment" />`);
                                }
                            });
                        }

                        const imageBuffer = await playwright.generateImage({
                            data: {
                                attachments: images.join(' '),
                                avatar: member.user.displayAvatarURL({
                                    forceStatic: true,
                                    size: 1024,
                                }),
                                content: parsedContent,
                                roleIcon:
                                    roleIconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                                timestamp: playwright.sanitize(timestamp),
                                username: `<span style="color: ${typeof coloredRole === 'string' ? coloredRole : String(coloredRole.hexColor)}">${playwright.sanitize(message.author?.username || 'Unknown User')}${
                                    message.member
                                        ? ` (${playwright.sanitize(
                                              message.member.nickname ||
                                                  message.author?.globalName ||
                                                  '',
                                          )})`
                                        : ''
                                }</span>`,
                                ...(repliedToMessage && repliedToMember
                                    ? {
                                          replyAvatar: repliedToMessage.author.displayAvatarURL(),
                                          replyContent: parsedReplyContent,
                                          replyUsername: `<span style="color: ${typeof repliedColorRole === 'string' ? repliedColorRole : String(repliedColorRole.hexColor)}">@${playwright.sanitize(
                                              repliedToMember.user.username || 'Unknown User',
                                          )}</span>`,
                                      }
                                    : {}),
                            },
                            html: this.messageTemplate,
                            selector: '.message-container',
                            viewport: { height: 200, width: 520 },
                        });

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
