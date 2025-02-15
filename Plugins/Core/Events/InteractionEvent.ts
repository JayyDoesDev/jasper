/* eslint @typescript-eslint/no-explicit-any: "off" */
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Interaction,
} from 'discord.js';
import { Command, defineEvent, message } from '../../../Common/define';
import { PermissionsToHuman, PlantPermission } from '@antibot/interactions';
import { withConfigurationRoles } from '../../../Common/db';

export = {
    Event: defineEvent({
        event: {
            name: 'interactionCreate',
            once: false,
        },
        on: async (interaction: Interaction, ctx) => {
            switch (true) {
                case interaction.isChatInputCommand() || interaction.isContextMenuCommand(): {
                    const command: Command<
                        ChatInputCommandInteraction | ContextMenuCommandInteraction
                    > = ctx.interactions.get(interaction.commandName);
                    if (command) {
                        if (command.restrictToConfigRoles?.length) {
                            const { noRolesWithConfig, noRolesNoConfig } =
                                await withConfigurationRoles(
                                    ctx,
                                    interaction,
                                    ...command.restrictToConfigRoles,
                                );

                            let configError = false;
                            noRolesWithConfig(interaction, () => {
                                configError = true;
                            });

                            noRolesNoConfig(interaction, () => {
                                message.content +=
                                    ' Configuration of roles required. Please check with the server administrator.';
                                configError = true;
                            });

                            if (configError) {
                                await interaction.reply(message);
                                message.content = "Sorry but you can't use this command.";
                                return;
                            }
                        }
                        if (command.permissions) {
                            const perms: any[] = [];
                            if (!interaction.appPermissions.has(command.permissions)) {
                                for (const permission of command.permissions) {
                                    perms.push(PermissionsToHuman(PlantPermission(permission)));
                                }
                                return interaction.reply({
                                    content: `I'm missing permissions! (${
                                        perms.length <= 2 ? perms.join(' & ') : perms.join(', ')
                                    })`,
                                    ephemeral: true,
                                });
                            }
                        }

                        command.on(ctx, interaction);
                    }
                    break;
                }
                case interaction.isAutocomplete(): {
                    const command: Command<
                        ChatInputCommandInteraction | ContextMenuCommandInteraction
                    > = ctx.interactions.get(interaction.commandName);
                    if (command && command.autocomplete) {
                        if (command.permissions) {
                            if (!interaction.appPermissions.has(command.permissions)) {
                                return interaction.respond([]);
                            }
                        }
                        command.autocomplete(ctx, interaction);
                    }
                    break;
                }
            }
        },
    }),
};
