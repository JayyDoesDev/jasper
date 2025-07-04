import { ApplicationCommandType } from '@antibot/interactions';
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    Message,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextChannel,
    TextDisplayBuilder,
} from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineCommand } from '../../../define';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Snipe a message!',
            name: 'snipe',
            options: [],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            const snipe = ctx.snipe.get(interaction.channelId) as Message<true> | undefined;

            if (!snipe) {
                return interaction.reply({
                    content: 'No message to snipe!',
                    flags: MessageFlags.Ephemeral,
                });
            }



            const attachmentUrls = Array.from(snipe.attachments.values())
                .filter((attachment) => attachment.url)
                .map((attachment) => attachment.url);

            const userMentions = snipe.mentions.users.map((user) =>
                [user.id, user.username].join(':'),
            );
            const channelMentions = snipe.mentions.channels.map((channel) => {
                if (channel.isDMBased()) return 'no-name';
                if (channel.isVoiceBased()) return 'voice-channel';
                return [channel.id, channel.name].join(':');
            });

            // Prepare role color
            const member = snipe.member;
            const coloredRole =
                member?.roles?.cache
                    ?.filter((role) => role.color !== 0)
                    ?.sort((a, b) => b.position - a.position)
                    ?.first() || '#FFFFFF';

            const avatarUrl = snipe.author.displayAvatarURL({ forceStatic: true, size: 1024 });
            const roleIconUrl = member?.roles?.highest?.iconURL() || '';

            if (
                !ctx.webserver.isValidUrl(avatarUrl) ||
                (roleIconUrl && !ctx.webserver.isValidUrl(roleIconUrl))
            ) {
                throw new Error('Invalid avatar or role icon URL');
            }

            // Build the request body
            const requestBody = {
                attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
                avatar: avatarUrl,
                content: snipe.content || '',
                mentions: [...userMentions, ...channelMentions],
                roleIcon: roleIconUrl,
                timestamp: ctx.webserver.sanitize(
                    new Date(snipe.createdTimestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        hour12: true,
                        minute: '2-digit',
                    }),
                ),
                username:
                    ctx.webserver.sanitize(snipe.author?.username || 'Unknown User') +
                    (member && member.nickname
                        ? ` (${ctx.webserver.sanitize(member.nickname || snipe.author?.globalName || '')})`
                        : ''),
                usernameColor:
                    typeof coloredRole === 'string' ? coloredRole : coloredRole.hexColor,
                // You can add reply fields if you want, as in the original
            };

            // Make the request and get the image buffer (like in messageReactionAddListener.ts)
            const response = await ctx.webserver.request(
                'POST',
                '/fun/skullboard',
                requestBody,
                true,
            );

            let screenshotUrl = '';
            let screenshotBuffer: Buffer | undefined;
            if (response && response.ok) {
                const buffer = await response.arrayBuffer();
                screenshotBuffer = Buffer.from(buffer);
                screenshotUrl = 'attachment://screenshot.png';
            }

            let containerBuilder = new ContainerBuilder()
                .setAccentColor(8224125)
           
            if (screenshotUrl) {
                containerBuilder = containerBuilder.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(
                        new MediaGalleryItemBuilder().setURL(screenshotUrl)
                    )
                );
            }

            containerBuilder = containerBuilder
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`-# Sniped! Sent <t:${Math.floor(snipe.createdTimestamp / 1000)}:R> in ${(snipe.channel as TextChannel)}`),
                );

            const components = [containerBuilder];

            return interaction.reply({
                components,
                files: screenshotBuffer ? [{ attachment: screenshotBuffer, name: 'screenshot.png' }] : [],
                flags: MessageFlags.IsComponentsV2,
            });
        },
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
    }),
};
