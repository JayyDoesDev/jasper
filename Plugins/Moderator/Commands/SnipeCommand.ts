import { ApplicationCommandType } from '@antibot/interactions';
import {
    APIEmbed,
    ChatInputCommandInteraction,
    Message,
    MessageFlags,
    TextChannel,
} from 'discord.js';

import { ConfigurationRoles } from '../../../Common/container';
import { defineCommand } from '../../../Common/define';
import { Context } from '../../../Source/Context';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Snipe a message!',
            name: 'snipe',
            options: [],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: (ctx: Context, interaction: ChatInputCommandInteraction) => {
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

            const attachment = snipe.attachments.first();

            if (snipe.embeds.length > 0) {
                const originalEmbeds = snipe.embeds.map((embed) => {
                    const embedData: APIEmbed = {
                        color: embed.color || global.embedColor,
                        description: embed.description,
                        fields: embed.fields || [],
                        timestamp: embed.timestamp,
                        title: embed.title || '',
                        url: embed.url || '',
                    };

                    if (embed.thumbnail) embedData.thumbnail = embed.thumbnail;
                    if (embed.image) embedData.image = embed.image;
                    if (embed.author) embedData.author = embed.author;
                    if (embed.footer) embedData.footer = embed.footer;

                    return embedData;
                });

                const metadataEmbed: APIEmbed = {
                    author: {
                        icon_url: snipe.author.displayAvatarURL(),
                        name: snipe.author.tag,
                    },
                    color: global.embedColor,
                    description: messageContent,
                    fields: [],
                    footer: {
                        text: `#${(snipe.channel as TextChannel).name}`,
                    },
                    timestamp: snipe.createdAt.toISOString(),
                    title: '',
                    url: '',
                };

                if (attachment) {
                    metadataEmbed.image = { url: attachment.url };
                }

                originalEmbeds.unshift(metadataEmbed);
                return interaction.reply({ embeds: originalEmbeds });
            }

            const baseEmbed: APIEmbed = {
                author: {
                    icon_url: snipe.author.displayAvatarURL(),
                    name: snipe.author.tag,
                },
                color: global.embedColor,
                description: messageContent,
                fields: [],
                footer: {
                    text: `#${(snipe.channel as TextChannel).name}`,
                },
                timestamp: snipe.createdAt.toISOString(),
                title: '',
                url: '',
            };

            if (attachment) {
                baseEmbed.image = { url: attachment.url };
            }

            return interaction.reply({
                embeds: [baseEmbed],
            });
        },
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
    }),
};
