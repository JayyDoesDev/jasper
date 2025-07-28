import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { SetInactiveThreadOptions } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const SetWarningCheckSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const warningCheck = interaction.options.getBoolean('boolean');

        await ctx.services.settings.configure<Options>({ guildId });
        const inactiveThreadSettings =
            await ctx.services.settings.getInactiveThreads<Snowflake>(guildId);

        if (inactiveThreadSettings?.warningCheck === warningCheck) {
            await interaction.reply({
                components: [
                    createConfigurationExistsEmbed({
                        configName: 'Inactive Threads (support threads)',
                        description: `${inactiveThreadSettings.warningCheck}`,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        await ctx.services.settings.setInactiveThreads<SetInactiveThreadOptions>({
            guildId,
            warningCheck,
        });

        await interaction.reply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Inactive Threads (support threads)',
                    description: `${warningCheck}`,
                }),
            ],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
    name: 'set_warning_check',
});

export const commandOptions = {
    description: 'Set the warning check for support threads',
    name: 'set_warning_check',
    options: [
        {
            description: 'Set the to warning check to true or false',
            name: 'boolean',
            required: true,
            type: ApplicationCommandOptionType.BOOLEAN,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
