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

export const AddSkullboardChannelSubCommand = defineSubCommand({
    name: 'add_skullboard_channel',
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
            guildId,
            channel: channel.id,
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
});

export const commandOptions = {
    name: 'add_skullboard_channel',
    description: 'Add a channel to the skullboard',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'channel',
            description: 'The channel to add to the skullboard',
            type: ApplicationCommandOptionType.CHANNEL,
            required: true,
        },
    ],
};
