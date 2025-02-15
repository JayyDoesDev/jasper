import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, SetRoleOptions } from '../../../Services/SettingsService';
import { Settings } from '../../../Models/GuildSchema';
import { getRoleConfigurationContainer } from '../../../Common/container';

export const RemoveRoleSubCommand = defineSubCommand({
    name: 'remove_role',
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const config = interaction.options.getString('config')! as keyof Settings['Roles'];
        const role = interaction.options.getRole('role')!;

        if (!getRoleConfigurationContainer().includes(config)) {
            await interaction.reply({
                content: `The configuration **${config}** does not exist.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.configure<Options>({ guildId });
        const roleExistsInDB = await ctx.services.settings.getRoles<Snowflake>(guildId, config);

        if (roleExistsInDB.includes(role.id)) {
            await ctx.services.settings.removeRoles<SetRoleOptions>({
                guildId,
                ...{ key: config, roles: role.id },
            });

            const updatedRoles = await ctx.services.settings.getRoles<Snowflake>(guildId, config);
            const updatedRoleNames = await Promise.all(
                updatedRoles.map(async (k) => `${(await interaction.guild.roles.fetch(k)).name}`),
            );
            const description = updatedRoleNames.join(', ') || 'No roles';
            await interaction.reply({
                content: `I've removed **${role.name}** from **${config}**`,
                embeds: [
                    {
                        title: 'Current Roles in Configuration',
                        description,
                        color: global.embedColor,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const roleNames = await Promise.all(
            roleExistsInDB.map(async (k) => `${(await interaction.guild.roles.fetch(k)).name}`),
        );
        const description = roleNames.join(', ') || 'No roles';

        await interaction.reply({
            content: `I couldn't find **${role.name}** inside of **${config}**`,
            embeds: [
                { title: 'Current Roles in Configuration', description, color: global.embedColor },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('config') || '';
        const filtered = getRoleConfigurationContainer()
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
});

export const commandOptions = {
    name: 'remove_role',
    description: 'Add a role to the configuration',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'config',
            description: 'Remove a role from the configuration',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: 'role',
            description: 'The role to remove',
            type: ApplicationCommandOptionType.ROLE,
            required: true,
        },
    ],
};
