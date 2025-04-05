import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import {
    createConfigurationExistsEmbed,
    createConfigurationUpdateEmbed,
} from '../../../Common/embeds';
import { Options } from '../../../Services/TagService';
import { GuildSnowflake } from '../../../Services/SettingsService';

export const SetSkullboardReactionThresholdSubCommand = defineSubCommand({
    name: 'set_skullboard_reaction_threshold',
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
});

export const commandOptions = {
    name: 'set_skullboard_reaction_thres',
    description: 'Set the skullboard reaction threshold',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'threshold',
            description: 'The threshold for the skullboard reaction',
            type: ApplicationCommandOptionType.STRING,
            required: true,
        },
    ],
};
