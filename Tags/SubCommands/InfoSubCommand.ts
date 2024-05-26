import { ApplicationCommandOptionType, ApplicationCommandOptions } from "@antibot/interactions";
import { Context } from "../../Context";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { GuildExists } from "../../Common/GuildExists";
import TagSchema from "../../Models/TagSchema";
import { Wrap } from "../../Common/Wrap";
import { TagExists } from "../Controllers/TagExists";
import { TagGet, TagGetPromise } from "../Controllers/TagGet";
export const InfoSubCommand: ApplicationCommandOptions = {
  name: "info",
  description: "Get the info of a tag!",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "tag-name",
      description: "Provide the tag name of the tag you would like to check!",
      type: ApplicationCommandOptionType.STRING,
      required: true
    }
  ]
} as ApplicationCommandOptions;

export function RunInfoSubCommand(ctx: Context, interaction: ChatInputCommandInteraction): void {
  RegisterSubCommand({
    subCommand: "info",
    ctx: ctx,
    interaction: interaction,
    callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
      const tagName: string = interaction.options.getString("tag-name");
      if (await TagExists(interaction.guild.id, tagName, ctx)) {
        const getTag: any = await TagGet(tagName, interaction.guild.id, ctx);
        return interaction.reply({
          embeds: [
            {
              title: tagName,
              color: 0xff9a00,
              description: `> **Created by ${getTag.TagAuthor ? `<@${getTag.TagAuthor}>` : "Unknown (created before the update)"}**`
            }
          ],
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
