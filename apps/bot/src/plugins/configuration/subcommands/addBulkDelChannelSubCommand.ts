import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { GuildSnowflake } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const AddBulkDelChannelSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const channel = interaction.options.getChannel('channel')!;

        console.log('hi');

        await ctx.services.settings.configure<Options>({ guildId });
        const bulkDelSettings =
            await ctx.services.settings.getBulkDeleteLogging<Snowflake>(guildId);

        if (bulkDelSettings?.LogChannel === channel.id) {
            await interaction.reply({
                components: [
                    createConfigurationExistsEmbed({
                        configName: 'Bulk Delete Logging',
                        description: `<#${bulkDelSettings.LogChannel}>`,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        console.log('hi');

        await ctx.services.settings.setBulkDeleteLogging<GuildSnowflake>({
            guildId,
            LogChannel: channel.id,
        });

        console.log('hi');

        await interaction.reply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Bulk Delete Logging',
                    description: `<#${channel.id}>`,
                }),
            ],
            flags: MessageFlags.IsComponentsV2,
        });
    },
    name: 'add_bulk_del_channel',
});

export const commandOptions = {
    description: 'Add a channel to log bulk deleted messages',
    name: 'add_bulk_del_channel',
    options: [
        {
            description: 'The channel to log to',
            name: 'channel',
            required: true,
            type: ApplicationCommandOptionType.CHANNEL,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
