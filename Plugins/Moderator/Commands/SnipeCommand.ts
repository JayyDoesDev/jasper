import { ApplicationCommandType } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import {
    APIEmbed,
    ChatInputCommandInteraction,
    Message,
    MessageFlags,
    TextChannel,
} from 'discord.js';
import { Context } from '../../../Source/Context';
import { ConfigurationRoles } from '../../../Common/container';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'snipe',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'Snipe a message!',
            options: [],
        },
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
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
                        title: embed.title || '',
                        description: embed.description,
                        fields: embed.fields || [],
                        color: embed.color || global.embedColor,
                        url: embed.url || '',
                        timestamp: embed.timestamp,
                    };

                    if (embed.thumbnail) embedData.thumbnail = embed.thumbnail;
                    if (embed.image) embedData.image = embed.image;
                    if (embed.author) embedData.author = embed.author;
                    if (embed.footer) embedData.footer = embed.footer;

                    return embedData;
                });

                const metadataEmbed: APIEmbed = {
                    title: '',
                    description: messageContent,
                    fields: [],
                    color: global.embedColor,
                    url: '',
                    author: {
                        name: snipe.author.tag,
                        icon_url: snipe.author.displayAvatarURL(),
                    },
                    footer: {
                        text: `#${(snipe.channel as TextChannel).name}`,
                    },
                    timestamp: snipe.createdAt.toISOString(),
                };

                if (attachment) {
                    metadataEmbed.image = { url: attachment.url };
                }

                originalEmbeds.unshift(metadataEmbed);
                return interaction.reply({ embeds: originalEmbeds });
            }

            const baseEmbed: APIEmbed = {
                title: '',
                description: messageContent,
                fields: [],
                color: global.embedColor,
                url: '',
                author: {
                    name: snipe.author.tag,
                    icon_url: snipe.author.displayAvatarURL(),
                },
                footer: {
                    text: `#${(snipe.channel as TextChannel).name}`,
                },
                timestamp: snipe.createdAt.toISOString(),
            };

            if (attachment) {
                baseEmbed.image = { url: attachment.url };
            }

            return interaction.reply({
                embeds: [baseEmbed],
            });
        },
    }),
};
