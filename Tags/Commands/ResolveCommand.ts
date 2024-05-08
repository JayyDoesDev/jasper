import {
  ApplicationCommandType,
  Snowflake
} from "@antibot/interactions";
import { Command, DefineCommand } from "../../Common/DefineCommand";
import { Context } from "../../Context";
import { ChannelType, ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType, PermissionsBitField } from "@antibot/interactions";

export const ResolveCommand: Command = DefineCommand({
  command: {
    name: "resolve",
    type: ApplicationCommandType.CHAT_INPUT,
    description: "Marks post as resolved and sends a message to inform OP",
    options: [
      {
        type: ApplicationCommandOptionType.STRING,
        name: "original_question",
        description: "Original Question asked by OP",
        required: false
      }, {
        type: ApplicationCommandOptionType.STRING,
        name: "summarized_answer",
        description: "Summarization of the answer to the OP's original question",
        required: false
      }
    ]
  },
  permissions: [PermissionsBitField.MANAGE_THREADS],
  on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
    if (
      checkForRoles(interaction, process.env.ADMIN_ROLE) ||
      checkForRoles(interaction, process.env.STAFF_ROLE) ||
      checkForRoles(interaction, process.env.SUPPORT_ROLE)
    ) {
      const finalReply: Record<"content", string> = { content: `Post marked as Resolved by <@${interaction.user.id}>` };
      const originalQuestion: string = interaction.options.getString("original_question");
      const summarizedAnswer: string = interaction.options.getString("summarized_answer");
      const embeds: Array<{ title: string; fields: Array<any>, color: number; }>
        = [{ title: "Overview", fields: [], color: 0xff9a00 }];
        if (interaction.channel.type == ChannelType.PublicThread) {
          if (!interaction.channel.appliedTags.includes("1144008960966402149")) {
            await interaction.channel.setAppliedTags(["1144008960966402149", ...interaction.channel.appliedTags]);
          }
          if (originalQuestion) {
            embeds[0].fields.push({ name: "Original Question", value: originalQuestion });
          }
          if (summarizedAnswer) {
            embeds[0].fields.push({ name: "Summarized Answer", value: summarizedAnswer });
          }
          if (embeds[0].fields.length > 0) {
            finalReply["embeds"] = embeds;
          }
          await interaction.reply(finalReply);
          if (!interaction.channel.locked) {
            await interaction.channel.setLocked(true);
          }
          if (!interaction.channel.archived) {
            await interaction.channel.setArchived(true);
          }
          return;
        } else {
          return interaction.reply({
            content: "Channel is not a thread. This command **must be** executed in Forum Posts!",
            ephemeral: true
          });
        }
    } return interaction.reply({
      content: "Sorry but you can't use this command.",
      ephemeral: true
    });
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
