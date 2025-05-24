import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { getRoleConfigurationContainer } from '../../../container';
import { defineSubCommand } from '../../../define';
import { createConfigurationUpdateEmbed } from '../../../embeds';
import { Settings } from '../../../models/guildSchema';
import { Options, SetRoleOptions } from '../../../services/settingsService';

export const RemoveRoleSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('config') || '';
        const filtered = getRoleConfigurationContainer()
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
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
                    createConfigurationUpdateEmbed({
                        configName: 'Roles',
                        description,
                        guild: interaction.guild!,
                    }),
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
                createConfigurationUpdateEmbed({
                    configName: 'Roles',
                    description,
                    guild: interaction.guild!,
                }),
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'remove_role',
});

export const commandOptions = {
    description: 'Add a role to the configuration',
    name: 'remove_role',
    options: [
        {
            autocomplete: true,
            description: 'Remove a role from the configuration',
            name: 'config',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
        {
            description: 'The role to remove',
            name: 'role',
            required: true,
            type: ApplicationCommandOptionType.ROLE,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
