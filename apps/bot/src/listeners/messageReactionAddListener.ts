import {
    AttachmentBuilder,
    MessageFlags,
    MessageReaction,
    PartialMessageReaction,
    TextChannel,
} from 'discord.js';
import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { Options } from '../services/settingsService';

import { Listener } from './listener';

interface WebserverRenderRequest {
    [key: string]: unknown;
    attachments?: null | string[];
    avatar: string;
    content: string;
    replyAvatar?: string;
    replyContent?: string;
    replyUsername?: string;
    replyUsernameColor?: string;
    roleIcon: string;
    timestamp: string;
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
            const { Channels, Skullboard } = this.ctx.services.settings.getSettings();
            const skulledService = this.ctx.services.skulledMessages.configure({ guildId });

            if (
                reaction.emoji.name !== Skullboard.SkullboardEmoji ||
                reaction.count < Skullboard.SkullboardReactionThreshold
            ) {
                return;
            }

            if (!Channels.AllowedSkullboardChannels.includes(reaction.message.channelId)) return;
            const isSKulled = await skulledService.add(reaction.message.id);
            if (!isSKulled) return;

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
                    const roleIconUrl = member?.roles?.highest?.iconURL() || '';

                    if (
                        !this.ctx.webserver.isValidUrl(avatarUrl) ||
                        (roleIconUrl && !this.ctx.webserver.isValidUrl(roleIconUrl))
                    ) {
                        throw new Error('Invalid avatar or role icon URL');
                    }

                    const attachmentUrls = Array.from(message.attachments.values())
                        .filter((attachment) => attachment.url)
                        .map((attachment) => attachment.url);

                    const userMentions = message.mentions.users.map((user) =>
                        [user.id, user.username].join(':'),
                    );
                    const channelMentions = message.mentions.channels.map((channel) => {
                        if (channel.isDMBased()) return 'no-name';
                        if (channel.isVoiceBased()) return 'voice-channel';
                        return [channel.id, channel.name].join(':');
                    });

                    const response = await this.ctx.webserver.request<WebserverRenderRequest>(
                        'POST',
                        '/fun/skullboard',
                        {
                            attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
                            avatar: member.user.displayAvatarURL({
                                forceStatic: true,
                                size: 1024,
                            }),
                            content: message.content || '',
                            mentions: [...userMentions, ...channelMentions],
                            roleIcon: roleIconUrl,
                            timestamp: this.ctx.webserver.sanitize(timestamp),
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

                    const components = [
                        new ContainerBuilder()
                            .addSectionComponents(
                                new SectionBuilder()
                                    .setThumbnailAccessory(
                                        new ThumbnailBuilder().setURL(
                                            member.user.displayAvatarURL({
                                                forceStatic: true,
                                                size: 1024,
                                            }),
                                        ),
                                    )
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            `### **Author:** <@${message.author?.id}>`,
                                        ),
                                        new TextDisplayBuilder().setContent(
                                            `### **ID:** \`${message.author?.id}\``,
                                        ),
                                    ),
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `### **Channel:** <#${message.channel.id}>`,
                                ),
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Large)
                                    .setDivider(true),
                            )
                            .addMediaGalleryComponents(
                                new MediaGalleryBuilder().addItems(
                                    new MediaGalleryItemBuilder().setURL(
                                        'attachment://screenshot.png',
                                    ),
                                ),
                            )
                            .addSectionComponents(
                                new SectionBuilder()
                                    .setButtonAccessory(
                                        new ButtonBuilder()
                                            .setStyle(ButtonStyle.Link)
                                            .setLabel('Jump to Message')
                                            .setURL(
                                                `https://discord.com/channels/${message.guildId}/${message.channel.id}/${message.id}`,
                                            ),
                                    )
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            `-# <t:${Math.floor(message.createdTimestamp / 1000)}:R>`,
                                        ),
                                    ),
                            ),
                    ];

                    await skullboardChannel
                        .send({
                            allowedMentions: { parse: [], roles: [], users: [] },
                            components,
                            content: '',
                            files: [attachment],
                            flags: MessageFlags.IsComponentsV2,
                        })
                        .then(async (skullboardMsg) => {
                            await skullboardMsg.react(Skullboard.SkullboardEmoji);
                        });
                } catch (error) {
                    console.error('Error generating message image:', error);

                    const components = [
                        new ContainerBuilder()
                            .addSectionComponents(
                                new SectionBuilder()
                                    .setThumbnailAccessory(
                                        new ThumbnailBuilder().setURL(
                                            member.user.displayAvatarURL({
                                                forceStatic: true,
                                                size: 1024,
                                            }),
                                        ),
                                    )
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            `### **Author:** <@${message.author?.id}>`,
                                        ),
                                        new TextDisplayBuilder().setContent(
                                            `### **ID:** \`${message.author?.id}\``,
                                        ),
                                    ),
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
                                    `### **Channel:** <#${message.channel.id}>`,
                                ),
                            )
                            .addSeparatorComponents(
                                new SeparatorBuilder()
                                    .setSpacing(SeparatorSpacingSize.Large)
                                    .setDivider(true),
                            )
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(`> ${message.content}`),
                            )
                            .addSectionComponents(
                                new SectionBuilder()
                                    .setButtonAccessory(
                                        new ButtonBuilder()
                                            .setStyle(ButtonStyle.Link)
                                            .setLabel('Jump to Message')
                                            .setURL(
                                                `https://discord.com/channels/${message.guildId}/${message.channel.id}/${message.id}`,
                                            ),
                                    )
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            `-# <t:${Math.floor(message.createdTimestamp / 1000)}:R>`,
                                        ),
                                    ),
                            ),
                    ];

                    await skullboardChannel
                        .send({
                            allowedMentions: { parse: [], roles: [], users: [] },
                            components,
                            content: '',
                            flags: MessageFlags.IsComponentsV2,
                        })
                        .then(async (skullboardMsg) => {
                            await skullboardMsg.react(Skullboard.SkullboardEmoji);
                        });
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
