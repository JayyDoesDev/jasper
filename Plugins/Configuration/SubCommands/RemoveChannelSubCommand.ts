import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { getChannelConfigurationContainer } from '../../../Common/container';
import { defineSubCommand } from '../../../Common/define';
import { createConfigurationUpdateEmbed } from '../../../Common/embeds';
import { Settings } from '../../../Models/GuildSchema';
import { Options, SetChannelOptions } from '../../../Services/SettingsService';
import { Context } from '../../../Source/Context';

export const RemoveChannelSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('config') || '';
        const filtered = getChannelConfigurationContainer()
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const config = interaction.options.getString('config')! as keyof Settings['Channels'];
        const channel = interaction.options.getChannel('channel')!;

        if (!getChannelConfigurationContainer().includes(config)) {
            await interaction.reply({
                content: `The configuration **${config}** does not exist.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.configure<Options>({ guildId });
        const channelExistsInDB = await ctx.services.settings.getChannels<Snowflake>(
            guildId,
            config,
        );

        if (channelExistsInDB.includes(channel.id)) {
            await ctx.services.settings.removeChannels<SetChannelOptions>({
                guildId,
                ...{ channels: channel.id, key: config },
            });

            const updatedChannels = await ctx.services.settings.getChannels<Snowflake>(
                guildId,
                config,
            );
            const description = updatedChannels.map((k) => `<#${k}>`).join(', ') || 'No channels';

            await interaction.reply({
                content: `I've removed **${channel}** from **${config}**`,
                embeds: [
                    createConfigurationUpdateEmbed({
                        configName: 'Channels',
                        description,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const description = channelExistsInDB.map((k) => `<#${k}>`).join(', ') || 'No channels';

        await interaction.reply({
            content: `I couldn't find **${channel}** inside of **${config}**`,
            embeds: [
                createConfigurationUpdateEmbed({
                    configName: 'Channels',
                    description,
                    guild: interaction.guild!,
                }),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'remove_channel',
});

export const commandOptions = {
    description: 'Remove a channel from the configuration',
    name: 'remove_channel',
    options: [
        {
            autocomplete: true,
            description: 'The configuration to remove the channel from',
            name: 'config',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
        {
            description: 'The channel to remove',
            name: 'channel',
            required: true,
            type: ApplicationCommandOptionType.CHANNEL,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
