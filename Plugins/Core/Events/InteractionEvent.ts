/* eslint @typescript-eslint/no-explicit-any: "off" */
import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Interaction } from "discord.js";
import { Command, defineEvent } from "../../../Common/define";
import { PermissionsToHuman, PlantPermission } from "@antibot/interactions";

export = {
  Event: defineEvent({
    event: {
        name: "interactionCreate",
        once: false,
    },
    on: (interaction: Interaction, ctx) => {
        switch (true) {
            case interaction.isChatInputCommand() || interaction.isContextMenuCommand(): {
                const command: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction> = ctx.interactions.get(interaction.commandName);
                if (command) {
                    if (command.permissions) {
                        const perms: any[] = [];
                        if (!interaction.appPermissions.has(command.permissions)) {
                            for (const permission of command.permissions) {
                                perms.push(PermissionsToHuman(PlantPermission(permission)));
                            }
                            return interaction.reply({
                                content: `I'm missing permissions! (${
                                    perms.length <= 2 ? perms.join(" & ") : perms.join(", ")
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
                const command: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction> = ctx.interactions.get(interaction.commandName);
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
  })
}
