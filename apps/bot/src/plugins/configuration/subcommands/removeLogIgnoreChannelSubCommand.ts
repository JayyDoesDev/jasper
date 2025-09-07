import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { createConfigurationUpdateEmbed } from '../../../embeds';
import { GuildSnowflake } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const RemoveLogIgnoreChannelSubCommand = defineSubCommand({
    deferral: { defer: true, ephemeral: true },

    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const channel = interaction.options.getChannel('channel')!;

        await ctx.services.settings.configure<Options>({ guildId });

        const bulkDelSettings =
            await ctx.services.settings.getBulkDeleteLogging<Snowflake>(guildId);

        let ignored = bulkDelSettings?.IgnoredLoggingChannels ?? [];

        if (!ignored.includes(channel.id)) {
            await interaction.editReply({
                components: [
                    createConfigurationUpdateEmbed({
                        configName: 'Ignored Channels',
                        description:
                            ignored.length > 0
                                ? ignored.map((id) => `<#${id}>`).join(', ')
                                : `I'm not ignoring any channels.`,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        ignored = ignored.filter((id) => id !== channel.id);

        await ctx.services.settings.setBulkDeleteLogging<GuildSnowflake>({
            guildId,
            IgnoredLoggingChannels: ignored,
        });

        const description =
            ignored.length > 0
                ? ignored.map((id) => `<#${id}>`).join(', ')
                : `I'm not ignoring any channels.`;

        await interaction.editReply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Ignored Channels',
                    description,
                }),
            ],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
    name: 'remove_log_ignore',
});

export const commandOptions = {
    description: 'Remove a channel currently being ignored',
    name: 'remove_log_ignore',
    options: [
        {
            description: 'The channel to remove',
            name: 'channel',
            required: true,
            type: ApplicationCommandOptionType.CHANNEL,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
