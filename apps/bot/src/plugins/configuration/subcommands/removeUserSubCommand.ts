import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { getUserConfigurationContainer } from '../../../container';
import { defineSubCommand } from '../../../define';
import { createConfigurationUpdateEmbed } from '../../../embeds';
import { Settings } from '../../../models/guildSchema';
import { Options, SetUsersOptions } from '../../../services/settingsService';

export const RemoveUserSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('config') || '';
        const filtered = getUserConfigurationContainer()
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .map((key) => ({ name: key as string, value: key as string }));
        await interaction.respond(filtered);
    },
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
    name: 'remove_user',
});

export const commandOptions = {
    description: 'Remove a user from a configuration',
    name: 'remove_user',
    options: [
        {
            autocomplete: true,
            description: 'Remove a user from the configuration',
            name: 'config',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
        {
            description: 'The user to remove from the configuration',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.USER,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
