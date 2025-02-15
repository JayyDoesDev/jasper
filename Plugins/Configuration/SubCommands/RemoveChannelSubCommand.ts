import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, SetChannelOptions } from '../../../Services/SettingsService';
import { Settings } from '../../../Models/GuildSchema';
import { getChannelConfigurationContainer } from '../../../Common/container';

export const RemoveChannelSubCommand = defineSubCommand({
    name: 'remove_channel',
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
                ...{ key: config, channels: channel.id },
            });

            const updatedChannels = await ctx.services.settings.getChannels<Snowflake>(
                guildId,
                config,
            );
            const description = updatedChannels.map((k) => `<#${k}>`).join(', ') || 'No channels';

            await interaction.reply({
                content: `I've removed **${channel}** from **${config}**`,
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

        const description = channelExistsInDB.map((k) => `<#${k}>`).join(', ') || 'No channels';

        await interaction.reply({
            content: `I couldn't find **${channel}** inside of **${config}**`,
            embeds: [
                {
                    title: 'Current Channels in Configuration',
                    description,
                    color: global.embedColor,
                },
            ],
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
    name: 'remove_channel',
    description: 'Remove a channel from the configuration',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'config',
            description: 'The configuration to remove the channel from',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: 'channel',
            description: 'The channel to remove',
            type: ApplicationCommandOptionType.CHANNEL,
            required: true,
        },
    ],
};
