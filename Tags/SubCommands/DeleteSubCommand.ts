import { Context } from "../../Context";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
import { ApplicationCommandOptionType, ApplicationCommandOptions } from "@antibot/interactions";
import { ChatInputCommandInteraction } from "discord.js";
import { TagExists } from "../Controllers/TagExists";
import { TagDelete } from "../Controllers/TagDelete";
import { Emojis } from "../../Common/Emojis";
export const DeleteSubCommand: ApplicationCommandOptions = {
  name: "delete",
  description: "Delete a tag!",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "tag-name",
      description: "Provide the tag name of the tag you would like to delete!",
      type: ApplicationCommandOptionType.STRING,
      required: true
    }
  ]
} as ApplicationCommandOptions;

export function RunDeleteSubCommand(ctx: Context, interaction: ChatInputCommandInteraction): void {
  RegisterSubCommand({
    subCommand: "delete",
    ctx: ctx,
    interaction: interaction,
    callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
      const tagName: string = interaction.options.getString("tag-name");
      if (await TagExists(interaction.guild.id, tagName, ctx)) {
        await TagDelete(interaction.guild.id, tagName, ctx);
        return interaction.reply({
          content: `${Emojis.CHECK_MARK} Successfully deleted \`${tagName}\`!`,
          ephemeral: true
        })
      } else {
        return interaction.reply({
          content: `Tag not found!`,
          ephemeral: true
        })
      }
    }
  });
};
