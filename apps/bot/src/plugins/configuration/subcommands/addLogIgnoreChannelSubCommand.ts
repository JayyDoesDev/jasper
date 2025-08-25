import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { GuildSnowflake } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const AddLogIgnoreChannelSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const channel = interaction.options.getChannel('channel')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const bulkDelSettings =
            await ctx.services.settings.getBulkDeleteLogging<Snowflake>(guildId);

        const ignored = bulkDelSettings?.IgnoredLoggingChannels ?? [];

        if (ignored.includes(channel.id)) {
            await interaction.reply({
                components: [
                    createConfigurationExistsEmbed({
                        configName: 'Bulk Delete Ignore Channel',
                        description: `<#${channel.id}> is already ignored.`,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        ignored.push(channel.id);

        await ctx.services.settings.setBulkDeleteLogging<GuildSnowflake>({
            guildId,
            IgnoredLoggingChannels: ignored,
        });

        await interaction.reply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Bulk Delete Ignore Channel',
                    description: `Now ignoring bulk delete logs in <#${channel.id}>.`,
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    },
    name: 'add_log_ignore',
});

export const commandOptions = {
    description: 'Ignore a channel from bulk delete logging',
    name: 'add_log_ignore',
    options: [
        {
            description: 'The channel to ignore',
            name: 'channel',
            required: true,
            type: ApplicationCommandOptionType.CHANNEL,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
