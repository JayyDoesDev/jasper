import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { getRoleConfigurationContainer } from '../../../container';
import { defineSubCommand } from '../../../define';
import { createConfigurationExistsEmbed, createConfigurationUpdateEmbed } from '../../../embeds';
import { Settings } from '../../../models/guildSchema';
import { Options, SetRoleOptions } from '../../../services/settingsService';

export const AddRoleSubCommand = defineSubCommand({
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
            const roleNames = await Promise.all(
                roleExistsInDB.map(async (k) => `${(await interaction.guild.roles.fetch(k)).name}`),
            );
            const description = roleNames.join(', ') || 'No roles';
            await interaction.reply({
                components: [
                    createConfigurationExistsEmbed({
                        configName: 'Roles',
                        description,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        await ctx.services.settings.setRoles<SetRoleOptions>({
            guildId,
            ...{ key: config, roles: role.id },
        });

        const updatedRoles = await ctx.services.settings.getRoles<Snowflake>(guildId, config);
        const updatedRoleNames = await Promise.all(
            updatedRoles.map(async (k) => `${(await interaction.guild.roles.fetch(k)).name}`),
        );
        const description = updatedRoleNames.join(', ') || 'No roles';

        await interaction.reply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Roles',
                    description,
                }),
            ],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    },
    name: 'add_role',
});

export const commandOptions = {
    description: 'Add a role to the configuration',
    name: 'add_role',
    options: [
        {
            autocomplete: true,
            description: 'The configuration to add the role to',
            name: 'config',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
        {
            description: 'The role to add',
            name: 'role',
            required: true,
            type: ApplicationCommandOptionType.ROLE,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
