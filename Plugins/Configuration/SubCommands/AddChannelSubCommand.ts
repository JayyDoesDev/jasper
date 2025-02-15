import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, SetChannelOptions } from '../../../Services/SettingsService';
import { Settings } from '../../../Models/GuildSchema';
import { getChannelConfigurationContainer } from '../../../Common/container';

export const AddChannelSubCommand = defineSubCommand({
    name: 'add_channel',
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
                    {
                        title: 'Current Channels in Configuration',
                        description,
                        color: global.embedColor,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setChannels<SetChannelOptions>({
            guildId,
            ...{ key: config, channels: channel.id },
        });

        const updatedChannels = await ctx.services.settings.getChannels<Snowflake>(guildId, config);
        const description = updatedChannels.map((k) => `<#${k}>`).join(', ') || 'No channels';

        await interaction.reply({
            content: `I've added **${channel}** to **${config}**`,
            embeds: [
                {
                    title: 'Current Channels in Configuration',
                    description,
                    color: global.embedColor,
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('config') || '';
        const filtered = getChannelConfigurationContainer()
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
});

export const commandOptions = {
    name: 'add_channel',
    description: 'Add a channel to the configuration',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'config',
            description: 'The configuration to add the channel to',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: 'channel',
            description: 'The channel to add',
            type: ApplicationCommandOptionType.CHANNEL,
            required: true,
        },
    ],
};
