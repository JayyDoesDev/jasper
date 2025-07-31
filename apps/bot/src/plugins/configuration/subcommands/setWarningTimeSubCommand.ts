import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { SetInactiveThreadOptions } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const SetWarningTimeSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const warningTime = interaction.options.getNumber('minutes');

        await ctx.services.settings.configure<Options>({ guildId });
        const inactiveThreadSettings =
            await ctx.services.settings.getInactiveThreads<Snowflake>(guildId);

        if (inactiveThreadSettings?.warningTime === warningTime) {
            await interaction.reply({
                components: [
                    createConfigurationExistsEmbed({
                        configName: 'Inactive Threads (support threads)',
                        description: `${inactiveThreadSettings.warningTime} minutes`,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        await ctx.services.settings.setInactiveThreads<SetInactiveThreadOptions>({
            guildId,
            warningTime,
        });

        await interaction.reply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Inactive Threads (support threads)',
                    description: `${warningTime} minutes`,
                }),
            ],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
    name: 'set_warning_time',
});

export const commandOptions = {
    description: 'Set the warning time for support threads',
    name: 'set_warning_time',
    options: [
        {
            description: 'Set the warning time',
            name: 'minutes',
            required: true,
            type: ApplicationCommandOptionType.NUMBER,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
