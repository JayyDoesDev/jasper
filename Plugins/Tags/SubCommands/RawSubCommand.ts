import { ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, codeBlock, MessageFlags } from "discord.js";
import { defineSubCommand } from "../../../Common/define";
import { Options, TagResponse } from "../../../Services/TagService";

export const RawSubCommand = defineSubCommand({
  name: "raw",
  handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
    const guildId = interaction.guildId!;
    const name = interaction.options.getString("tag-name", true);

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await ctx.services.tags.configure<Options>({ guildId, name });
    const tag = await ctx.services.tags.getValues<Options, TagResponse>();
    
    if (!tag) {
      await interaction.editReply("Tag not found.");
      return;
    }

    const rawContent = {
      name: tag.TagName,
      title: tag.TagEmbedTitle,
      description: tag.TagEmbedDescription,
      imageUrl: tag.TagEmbedImageURL,
      footer: tag.TagEmbedFooter
    };

    await interaction.editReply({
      content: codeBlock('json', JSON.stringify(rawContent, null, 2))
    });
  },
  autocomplete: async (ctx: Context, interaction) => {
    const guildId = interaction.guildId!;
    const query = interaction.options.getString("tag-name") || "";

    const tags = await ctx.services.tags.getMultiValues<string, TagResponse[]>(guildId);
    const filtered = tags
      .filter(tag => tag.TagName.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 25)
      .map(tag => ({ name: tag.TagName, value: tag.TagName }));

    await interaction.respond(filtered);
  }
});

export const commandOptions = {
  name: RawSubCommand.name,
  description: "Show the raw content of a tag",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "tag-name",
      description: "The name of the tag to show raw content for",
      type: ApplicationCommandOptionType.STRING,
      required: true,
      autocomplete: true
    }
  ]
};
