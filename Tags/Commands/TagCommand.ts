import { ApplicationCommandOptions, ApplicationCommandType, } from "@antibot/interactions";
import { DefineCommand } from "../../Common/DefineCommand";
import { Context } from "../../Context";
import { ChatInputCommandInteraction } from "discord.js";
import {
    CreateSubCommand,
    DeleteSubCommand,
    EditSubCommand,
    InfoSubCommand,
    ListSubCommand,
    RunCreateSubCommand,
    RunDeleteSubCommand,
    RunEditSubCommand,
    RunInfoSubCommand,
    RunListSubCommand,
    RunShowSubCommand,
    RunUseSubCommand,
    ShowSubCommand,
    UseSubCommand
} from "../SubCommands";
import { CheckForRoles } from "../../Common/CheckForRoles";

const subCommands: ApplicationCommandOptions[] = [
    CreateSubCommand,
    ListSubCommand,
    DeleteSubCommand,
    EditSubCommand,
    ShowSubCommand,
    InfoSubCommand,
    UseSubCommand,
];

export const TagCommand = DefineCommand<ChatInputCommandInteraction>({
    command: {
        name: "tag",
        type: ApplicationCommandType.CHAT_INPUT,
        description: "Create, list, edit, and delete tags!",
        options: subCommands,
    },
    on: async (ctx: Context, interaction) => {
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === "delete") {
          if (CheckForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE)) {
            await RunDeleteSubCommand(ctx, interaction);
          } else {
              return interaction.reply({
                content: "Sorry but you can't use this command.",
                ephemeral: true,
            });
          }
      }

        if (CheckForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
            if (subCommand === "create") {
                await RunCreateSubCommand(ctx, interaction);
            } else if (subCommand === "list") {
                await RunListSubCommand(ctx, interaction);
            } else if (subCommand === "edit") {
                await RunEditSubCommand(ctx, interaction);
            } else if (subCommand === "show") {
                await RunShowSubCommand(ctx, interaction);
            } else if (subCommand === "info") {
                await RunInfoSubCommand(ctx, interaction);
            } else if (subCommand === "use") {
                await RunUseSubCommand(ctx, interaction);
            }
        } else {
            return interaction.reply({
                content: "Sorry but you can't use this command.",
                ephemeral: true,
            });
        }
        return;
    },
    autocomplete: async (ctx: Context, interaction) => {
        const subCommand = interaction.options.getSubcommand();

        if (!CheckForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
            return interaction.respond([]);
        }

        switch (subCommand) {
            case 'use':
                await RunUseSubCommand(ctx, interaction);
                break;
            case 'show':
                await RunShowSubCommand(ctx, interaction);
                break;
            case 'delete':
                await RunDeleteSubCommand(ctx, interaction);
                break;
            case 'info':
                await RunInfoSubCommand(ctx, interaction);
                break;
            default:
                return interaction.respond([]);
        }
    }
});
