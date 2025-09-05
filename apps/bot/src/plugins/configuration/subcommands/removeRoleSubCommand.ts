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

    deferral: { defer: true, ephemeral: true },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const config = interaction.options.getString('config')! as keyof Settings['Roles'];
        const role = interaction.options.getRole('role')!;

        if (!getRoleConfigurationContainer().includes(config)) {
            await interaction.editReply({
                content: `The configuration **${config}** does not exist.`,
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
            const updatedRoleMentions = updatedRoles.map((roleId) => `<@&${roleId}>`);
            const description = updatedRoleMentions.join(', ') || 'No roles';
            await interaction.editReply({
                components: [
                    createConfigurationUpdateEmbed({
                        configName: 'Roles',
                        description,
                    }),
                ],
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
            return;
        }

        const roleMentions = roleExistsInDB.map((roleId) => `<@&${roleId}>`);
        const description = roleMentions.join(', ') || 'No roles';

        await interaction.editReply({
            components: [
                createConfigurationUpdateEmbed({
                    configName: 'Roles',
                    description,
                }),
            ],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
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
