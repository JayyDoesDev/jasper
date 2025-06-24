import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { getChannelConfigurationContainer } from '../../../container';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { Settings } from '../../../models/guildSchema';
import { Options, SetChannelOptions } from '../../../services/settingsService';

export const AddChannelSubCommand = defineSubCommand({
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
            const description = channelExistsInDB.map((k) => `<#${k}>`).join(', ') || 'No channels';
            await interaction.reply({
                content: `For the record, **${channel}** is already in **${config}**`,
                embeds: [
                    createConfigurationExistsEmbed({
                        configName: 'Channels',
                        description,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setChannels<SetChannelOptions>({
            guildId,
            ...{ channels: channel.id, key: config },
        });

        const updatedChannels = await ctx.services.settings.getChannels<Snowflake>(guildId, config);
        const description = updatedChannels.map((k) => `<#${k}>`).join(', ') || 'No channels';

        await interaction.reply({
            content: `I've added **${channel}** to **${config}**`,
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
    name: 'add_channel',
});

export const commandOptions = {
    description: 'Add a channel to the configuration',
    name: 'add_channel',
    options: [
        {
            autocomplete: true,
            description: 'The configuration to add the channel to',
            name: 'config',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
        {
            description: 'The channel to add',
            name: 'channel',
            required: true,
            type: ApplicationCommandOptionType.CHANNEL,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
