import { ApplicationCommandOptionType, ApplicationCommandType, PermissionsBitField } from "@antibot/interactions";
import { DefineCommand } from "../../../Common/DefineCommand";
import { ChannelType, ChatInputCommandInteraction } from "discord.js";
import { CheckForRoles } from "../../../Common/CheckForRoles";

export = {
  Command: DefineCommand<ChatInputCommandInteraction>({
    command: {
      name: "resolve",
      type: ApplicationCommandType.CHAT_INPUT,
      description: "Marks post as resolved and sends a message to inform OP",
      options: [
          {
              type: ApplicationCommandOptionType.STRING,
              name: "original_question",
              description: "Original Question asked by OP",
              required: false,
          },
          {
              type: ApplicationCommandOptionType.STRING,
              name: "summarized_answer",
              description:
                  "Summarization of the answer to the OP's original question",
              required: false,
          },
      ],
  },
  permissions: [ PermissionsBitField.ManageThreads ],
  on: async (ctx, interaction) => {
      if (CheckForRoles(interaction, ctx.env.get("admin"), ctx.env.get("staff"), ctx.env.get("support"))) {
          const finalReply: Record<"content", string> = { content: `Post marked as Resolved by <@${ interaction.user.id }>`, };
          const originalQuestion: string = interaction.options.getString("original_question");
          const summarizedAnswer: string = interaction.options.getString("summarized_answer");
            const embeds: { title: string, fields: { name: string, value: string }[], color: number }[] = [ { title: "Overview", fields: [], color: 0x323338 }]
          if (interaction.channel.type == ChannelType.PublicThread) {
              if (!interaction.channel.appliedTags.includes("1144008960966402149")) {
                  await interaction.channel.setAppliedTags([
                      "1144008960966402149",
                      ...interaction.channel.appliedTags,
                  ]);
              }
              if (originalQuestion) {
                  embeds[0].fields.push({
                      name: "Original Question",
                      value: originalQuestion,
                  });
              }
              if (summarizedAnswer) {
                  embeds[0].fields.push({
                      name: "Summarized Answer",
                      value: summarizedAnswer,
                  });
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
                  content:
                      "Channel is not a thread. This command **must be** executed in Forum Posts!",
                  ephemeral: true,
              });
          }
      }
      return interaction.reply({
          content: "Sorry but you can't use this command.",
          ephemeral: true,
      });
    },
  })
}
