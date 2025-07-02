import { ApplicationCommandType } from '@antibot/interactions';
import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Message,
    MessageFlags,
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

            const messageContent = snipe.content
                ? snipe.content.length > 1000
                    ? `${snipe.content.slice(0, 1000)}...`
                    : snipe.content
                : '';

            const member = snipe.guild.members.resolve(snipe.author.id);
            if (!member) {
                return interaction.reply({
                    content: 'Could not resolve message author.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            const timestamp = new Date(snipe.createdTimestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true,
                minute: '2-digit',
            });

            const avatarUrl = member.user.displayAvatarURL({ forceStatic: true, size: 1024 });
            const roleIconUrl = member.roles.highest?.iconURL() || '';

            const coloredRole =
                member.roles.cache
                    .filter((role) => role.color !== 0)
                    .sort((a, b) => b.position - a.position)
                    .first();

            const renderRequestBody = {
                attachments: snipe.attachments.map(a => a.url),
                avatar: avatarUrl,
                content: messageContent,
                roleIcon: roleIconUrl,
                timestamp,
                username: member.user.username,
                usernameColor: typeof coloredRole === 'string' ? coloredRole : coloredRole.hexColor,
            };

            const response = await ctx.webserver.request(
                'POST',
                '/fun/skullboard',
                renderRequestBody,
                true
            );

            if (!response.ok) {
                return interaction.reply({
                    content: 'Failed to generate image.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            const snipeAttachment = new AttachmentBuilder(buffer, { name: 'snipe.png' });


            return interaction.reply({
                files: [snipeAttachment],
            });
        },
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
    }),
};
