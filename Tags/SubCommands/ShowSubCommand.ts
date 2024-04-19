import { ApplicationCommandOptionType, ApplicationCommandOptions } from "@antibot/interactions";
import { Context } from "../../Context";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { TagExists } from "../Controllers/TagExists";
import { TagGet } from "../Controllers/TagGet";
export const ShowSubCommand: ApplicationCommandOptions = {
  name: "show",
  description: "Show a tag!",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "tag-name",
      description: "Provide the name of the tag you would like to check out!",
      type: ApplicationCommandOptionType.STRING,
      required: true
    }
  ]
} as ApplicationCommandOptions;

export function RunShowSubCommand(ctx: Context, interaction: ChatInputCommandInteraction): void {
  RegisterSubCommand({
    subCommand: "show",
    ctx: ctx,
    interaction: interaction,
    callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
      const tagName: string = interaction.options.getString("tag-name");
      if (await TagExists(interaction.guild.id, tagName)) {
        const getTag = await TagGet(tagName, interaction.guild.id);
        return interaction.reply({
          embeds: [
            {
              title: getTag.TagEmbedTitle,
              color: 0xff9a00,
              description: getTag.TagEmbedDescription ? getTag.TagEmbedDescription : null,
              footer: {
                text: getTag.TagEmbedFooter ? getTag.TagEmbedFooter : null
              }
            }
          ],
          ephemeral: true
        })
      } else {
        return interaction.reply({ content: `> The support tag \`${tagName}\` doesn't exists!`, ephemeral: true });
      }
    }
  });
};
