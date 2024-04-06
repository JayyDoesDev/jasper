import {
  ApplicationCommandOptions,
  ApplicationCommandType,
} from "@antibot/interactions";
import { Command, DefineCommand } from "../../Common/DefineCommand";
import { Context } from "../../Context";
import { ChatInputCommandInteraction, Snowflake } from "discord.js";
const subCommands : ApplicationCommandOptions[] = [

];

export const TagCommand: Command = DefineCommand({
  command: {
    name: "tag",
    type: ApplicationCommandType.CHAT_INPUT,
    description: "Create, list, edit, and delete tags!",
    options: subCommands
  },
  on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
    if (
      checkForRoles(interaction, process.env.SUPPORT_ROLE) ||
      checkForRoles(interaction, process.env.ADMIN_ROLE) ||
      checkForRoles(interaction, process.env.STAFF_ROLE)
    ) {

    } else {
      return interaction.reply({
        content: "Sorry but you can't use this command.",
        ephemeral: true
      });
    };
  };
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
