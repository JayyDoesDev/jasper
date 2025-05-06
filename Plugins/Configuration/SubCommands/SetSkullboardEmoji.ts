import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { defineSubCommand } from '../../../Common/define';
import {
    createConfigurationExistsEmbed,
    createConfigurationUpdateEmbed,
} from '../../../Common/embeds';
import { validateEmoji } from '../../../Common/regex';
import { GuildSnowflake } from '../../../Services/SettingsService';
import { Options } from '../../../Services/TagService';
import { Context } from '../../../Source/Context';

export const SetSkullboardEmojiSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const emoji = interaction.options.getString('emoji')!;

        if (!validateEmoji(emoji)) {
            await interaction.reply({
                content: `The emoji **${emoji}** is not valid.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.configure<Options>({ guildId });
        const skullboardSettings = await ctx.services.settings.getSkullboard<Snowflake>(guildId);

        if (skullboardSettings?.SkullboardEmoji === emoji) {
            await interaction.reply({
                content: `For the record, **${emoji}** is already set as the skullboard emoji.`,
                embeds: [
                    createConfigurationExistsEmbed({
                        configName: 'Skullboard',
                        description: `${skullboardSettings.SkullboardEmoji}`,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setSkullboard<GuildSnowflake>({
            emoji: emoji,
            guildId,
        });

        await interaction.reply({
            content: `**${emoji}** has been set as the skullboard emoji.`,
            embeds: [
                createConfigurationUpdateEmbed({
                    configName: 'Skullboard',
                    description: `${emoji}`,
                    guild: interaction.guild!,
                }),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'set_skullboard_emoji',
});

export const commandOptions = {
    description: 'Set the emoji for the skullboard',
    name: 'set_skullboard_emoji',
    options: [
        {
            description: 'The emoji to set for the skullboard',
            name: 'emoji',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
