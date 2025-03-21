import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, SetUsersOptions } from '../../../Services/SettingsService';
import { getUserConfigurationContainer } from '../../../Common/container';
import { Settings } from '../../../Models/GuildSchema';
import { createConfigurationUpdateEmbed } from '../../../Common/embeds';

export const RemoveUserSubCommand = defineSubCommand({
    name: 'remove_user',
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const config = interaction.options.getString('config')! as keyof Settings['Users'];
        const user = interaction.options.getUser('user')!;

        if (!getUserConfigurationContainer().includes(config)) {
            await interaction.reply({
                content: `The configuration **${config}** does not exist.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.configure<Options>({ guildId });
        const userExistsInDB = await ctx.services.settings.getUsers<Snowflake>(guildId, config);

        if (userExistsInDB.includes(user.id)) {
            await ctx.services.settings.removeUsers<SetUsersOptions>({
                guildId,
                ...{ key: config, users: user.id },
            });

            const updatedUsers = await ctx.services.settings.getUsers<Snowflake>(guildId, config);
            const updatedUserNames = await Promise.all(
                updatedUsers.map(async (k) => `${(await interaction.guild.members.fetch(k)).user}`),
            );
            const description = updatedUserNames.join(', ') || 'No users';
            await interaction.reply({
                content: `I've removed **${user.username}** from **${config}**`,
                embeds: [
                    createConfigurationUpdateEmbed({
                        configName: 'Users',
                        description,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const userNames = await Promise.all(
            userExistsInDB.map(async (k) => `${(await interaction.guild.members.fetch(k)).user}`),
        );
        const description = userNames.join(', ') || 'No users';

        await interaction.reply({
            content: `I couldn't find **${user.username}** inside of **${config}**`,
            embeds: [
                createConfigurationUpdateEmbed({
                    configName: 'Users',
                    description,
                    guild: interaction.guild!,
                }),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('config') || '';
        const filtered = getUserConfigurationContainer()
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .map((key) => ({ name: key as string, value: key as string }));
        await interaction.respond(filtered);
    },
});

export const commandOptions = {
    name: 'remove_user',
    description: 'Remove a user from a configuration',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'config',
            description: 'Remove a user from the configuration',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: 'user',
            description: 'The user to remove from the configuration',
            type: ApplicationCommandOptionType.USER,
            required: true,
        },
    ],
};
