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
  RunShowSubCommand 
} from "../SubCommands";
const subCommands: ApplicationCommandOptions[] = [
  CreateSubCommand,
  ListSubCommand,
  DeleteSubCommand,
  EditSubCommand,
  ShowSubCommand
];

export const TagCommand: Command = DefineCommand({
  command: {
    name: "tag",
    type: ApplicationCommandType.CHAT_INPUT,
    description: "Create, list, edit, and delete tags!",
    options: subCommands
  },
  on: (ctx: Context, interaction: ChatInputCommandInteraction) => {
    if (
      checkForRoles(interaction, process.env.ADMIN_ROLE) ||
      checkForRoles(interaction, process.env.STAFF_ROLE)
    ) {
      RunCreateSubCommand(ctx, interaction);
      RunListSubCommand(ctx, interaction);
      RunDeleteSubCommand(ctx, interaction);
      RunEditSubCommand(ctx, interaction);
      RunShowSubCommand(ctx, interaction);
    } else if (
      checkForRoles(interaction, process.env.ADMIN_ROLE) ||
      checkForRoles(interaction, process.env.STAFF_ROLE) ||
      checkForRoles(interaction, process.env.SUPPORT_ROLE)
    ) {
      RunListSubCommand(ctx, interaction);
      RunCreateSubCommand(ctx, interaction);
      RunEditSubCommand(ctx, interaction);
      RunShowSubCommand(ctx, interaction);
    } else {
      return interaction.reply({
        content: "Sorry but you can't use this command.",
        ephemeral: true
      });
    };
  }
}) as Command;


function checkForRoles(r: ChatInputCommandInteraction, role: Snowflake): boolean {
  const roles = r.member.roles.valueOf();
  const convertToArray: string[] = Array.from(roles as any);
  let response: boolean;
  for (let i = 0; i < convertToArray.length; i++) {
    if (convertToArray[i][0].includes(role)) {
      response = true;
      break;
    };
  };
  return response;
}
