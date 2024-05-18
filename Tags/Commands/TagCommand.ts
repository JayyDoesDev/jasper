import {
  ApplicationCommandOptions,
  ApplicationCommandType,
  Snowflake
} from "@antibot/interactions";
import { Command, DefineCommand } from "../../Common/DefineCommand";
import { Context } from "../../Context";
import { ChatInputCommandInteraction } from "discord.js";
import { RunCreateSubCommand } from "../SubCommands/CreateSubCommand";
import {
  CreateSubCommand,
  DeleteSubCommand,
  ListSubCommand,
  RunDeleteSubCommand,
  RunListSubCommand,
  EditSubCommand,
  RunEditSubCommand,
  ShowSubCommand,
  RunShowSubCommand,
  InfoSubCommand,
  RunInfoSubCommand
} from "../SubCommands";
import { CheckForRoles } from "../../Common/CheckForRoles";
const subCommands: ApplicationCommandOptions[] = [
  CreateSubCommand,
  ListSubCommand,
  DeleteSubCommand,
  EditSubCommand,
  ShowSubCommand,
  InfoSubCommand
];

export const TagCommand: Command = DefineCommand({
  command: {
    name: "tag",
    type: ApplicationCommandType.CHAT_INPUT,
    description: "Create, list, edit, and delete tags!",
    options: subCommands
  },
  on: (ctx: Context, interaction: ChatInputCommandInteraction) => {
    if (CheckForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE)) {
      RunCreateSubCommand(ctx, interaction);
      RunListSubCommand(ctx, interaction);
      RunDeleteSubCommand(ctx, interaction);
      RunEditSubCommand(ctx, interaction);
      RunShowSubCommand(ctx, interaction);
      RunInfoSubCommand(ctx, interaction);
    } else if (CheckForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
      RunListSubCommand(ctx, interaction);
      RunCreateSubCommand(ctx, interaction);
      RunEditSubCommand(ctx, interaction);
      RunShowSubCommand(ctx, interaction);
      RunInfoSubCommand(ctx, interaction);
    } else {
      return interaction.reply({
        content: "Sorry but you can't use this command.",
        ephemeral: true
      });
    };
  }
}) as Command;


