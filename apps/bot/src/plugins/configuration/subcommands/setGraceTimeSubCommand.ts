import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { SetInactiveThreadOptions } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const SetGraceTimeSubCommand = defineSubCommand({
    deferral: { defer: true, ephemeral: true },

    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const graceTime = interaction.options.getNumber('minutes');

        await ctx.services.settings.configure<Options>({ guildId });
        const inactiveThreadSettings =
            await ctx.services.settings.getInactiveThreads<Snowflake>(guildId);

        if (inactiveThreadSettings?.graceTime === graceTime) {
            await interaction.editReply({
                components: [
                    createConfigurationExistsEmbed({
                        configName: 'Inactive Threads (support threads)',
                        description: `${inactiveThreadSettings.graceTime} minutes`,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        await ctx.services.settings.setInactiveThreads<SetInactiveThreadOptions>({
            graceTime,
            guildId,
        });

        await interaction.editReply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Inactive Threads (support threads)',
                    description: `${graceTime} minutes`,
                }),
            ],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
    name: 'set_grace_time',
});

export const commandOptions = {
    description: 'Set the grace time for support threads',
    name: 'set_grace_time',
    options: [
        {
            description: 'Set the grace time',
            name: 'minutes',
            required: true,
            type: ApplicationCommandOptionType.NUMBER,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
