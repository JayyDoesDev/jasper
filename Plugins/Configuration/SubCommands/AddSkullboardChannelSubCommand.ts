import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { defineSubCommand } from '../../../Common/define';
import {
    createConfigurationExistsEmbed,
    createConfigurationUpdateEmbed,
} from '../../../Common/embeds';
import { GuildSnowflake } from '../../../Services/SettingsService';
import { Options } from '../../../Services/TagService';
import { Context } from '../../../Source/Context';

export const AddSkullboardChannelSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const channel = interaction.options.getChannel('channel')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const skullboardSettings = await ctx.services.settings.getSkullboard<Snowflake>(guildId);

        if (skullboardSettings?.SkullboardChannel === channel.id) {
            await interaction.reply({
                content: `For the record, **${channel}** is already set as the skullboard channel.`,
                embeds: [
                    createConfigurationExistsEmbed({
                        configName: 'Skullboard',
                        description: `<#${skullboardSettings.SkullboardChannel}>`,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setSkullboard<GuildSnowflake>({
            channel: channel.id,
            guildId,
        });

        await interaction.reply({
            content: `**${channel}** has been set as the skullboard channel.`,
            embeds: [
                createConfigurationUpdateEmbed({
                    configName: 'Skullboard',
                    description: `<#${channel.id}>`,
                    guild: interaction.guild!,
                }),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'add_skullboard_channel',
});

export const commandOptions = {
    description: 'Add a channel to the skullboard',
    name: 'add_skullboard_channel',
    options: [
        {
            description: 'The channel to add to the skullboard',
            name: 'channel',
            required: true,
            type: ApplicationCommandOptionType.CHANNEL,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
