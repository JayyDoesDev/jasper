import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import {
    createConfigurationExistsEmbed,
    createConfigurationUpdateEmbed,
} from '../../../embeds';
import { GuildSnowflake } from '../../../services/settingsService';
import { Options } from '../../../services/tagService';

export const SetSkullboardReactionThresholdSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const threshold = interaction.options.getInteger('threshold')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const skullboardSettings = await ctx.services.settings.getSkullboard<Snowflake>(guildId);

        if (skullboardSettings?.SkullboardReactionThreshold === threshold) {
            await interaction.reply({
                content: `For the record, **${threshold}** is already set as the skullboard reaction threshold.`,
                embeds: [
                    createConfigurationExistsEmbed({
                        configName: 'Skullboard',
                        description: `${skullboardSettings.SkullboardReactionThreshold}`,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setSkullboard<GuildSnowflake>({
            guildId,
            threshold: threshold,
        });

        await interaction.reply({
            content: `**${threshold}** has been set as the skullboard reaction threshold.`,
            embeds: [
                createConfigurationUpdateEmbed({
                    configName: 'Skullboard',
                    description: `${threshold}`,
                    guild: interaction.guild!,
                }),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'set_skullboard_reaction_threshold',
});

export const commandOptions = {
    description: 'Set the skullboard reaction threshold',
    name: 'set_skullboard_reaction_thres',
    options: [
        {
            description: 'The threshold for the skullboard reaction',
            name: 'threshold',
            required: true,
            type: ApplicationCommandOptionType.INTEGER,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
