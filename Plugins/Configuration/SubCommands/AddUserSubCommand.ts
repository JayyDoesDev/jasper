import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, SetUsersOptions } from '../../../Services/SettingsService';
import { getUserConfigurationContainer } from '../../../Common/container';
import { Settings } from '../../../Models/GuildSchema';
import {
    createConfigurationExistsEmbed,
    createConfigurationUpdateEmbed,
} from '../../../Common/embeds';

export const AddUserSubCommand = defineSubCommand({
    name: 'add_user',
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
            const userNames = await Promise.all(
                userExistsInDB.map(
                    async (k) => `${(await interaction.guild.members.fetch(k)).displayName}`,
                ),
            );
            const description = userNames.join(', ') || 'No users';
            await interaction.reply({
                content: `For the record, **${user.username}** is already in **${config}**`,
                embeds: [
                    createConfigurationExistsEmbed({
                        configName: 'Users',
                        description,
                        guild: interaction.guild!,
                    }),
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setUsers<SetUsersOptions>({
            guildId,
            ...{ key: config, users: user.id },
        });

        const updatedUsers = await ctx.services.settings.getUsers<Snowflake>(guildId, config);
        const updatedUserNames = await Promise.all(
            updatedUsers.map(async (k) => `${(await interaction.guild.members.fetch(k)).user}`),
        );
        const description = updatedUserNames.join(', ') || 'No users';

        await interaction.reply({
            content: `I've added **${user.username}** to **${config}**`,
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
    name: 'add_user',
    description: 'Add a user to a configuration',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'config',
            description: 'The configuration to add the user to',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: 'user',
            description: 'The user to add to the configuration',
            type: ApplicationCommandOptionType.USER,
            required: true,
        },
    ],
};
