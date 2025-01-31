import { ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { defineSubCommand } from "../../../Common/define";
import { Options, TagResponse } from "../../../Services/TagService";

export const DeleteSubCommand = defineSubCommand({
  name: "delete",
  handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
    const guildId = interaction.guildId!;
    const name = interaction.options.getString("tag-name", true);

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await ctx.services.tags.configure<Options>({ guildId, name });
    const isDeleted = await ctx.services.tags.deleteValue<Options, boolean>();
    
    if (!isDeleted) {
      await interaction.editReply("Tag not found.");
      return;
    }

    await interaction.editReply("Tag deleted successfully.");
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
  name: DeleteSubCommand.name,
  description: "Delete a tag!",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "tag-name",
      description: "The name of the tag to delete",
      type: ApplicationCommandOptionType.STRING,
      required: true,
      autocomplete: true
    }
  ]
};
