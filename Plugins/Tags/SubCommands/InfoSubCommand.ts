import { ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { defineSubCommand } from "../../../Common/define";
import { Options, TagResponse } from "../../../Services/TagService";
import { Emojis } from "../../../Common/enums";


export const InfoSubCommand = defineSubCommand({
  name: "info",
  allowedRoles: [process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE],
  handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
    const guildId = interaction.guildId!;
    const name = interaction.options.getString("tag-name");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    await ctx.services.tags.configure<Options>({ guildId, name });
    const tag = await ctx.services.tags.getValues<Options, TagResponse>();
    
    if (!tag) {
      await interaction.editReply("Tag not found.");
      return;
    }

    const exists = (value: string | undefined) => value ? Emojis.CHECK_MARK : Emojis.CROSS_MARK;

    const embed = {
      thumbnail: { url: ctx.user.displayAvatarURL() },
      title: `Tag Info: ${tag.TagName}`,
      color: global.embedColor,
      fields: [
        {
          name: "Author",
          value: tag.TagAuthor ? `<@${tag.TagAuthor}>` : "Unknown",
          inline: true
        },
        {
          name: "Edited by",
          value: tag.TagEditedBy ? `<@${tag.TagEditedBy}>` : "Orignal Author",
          inline: true
        },
        {
          name: "Title",
          value: tag.TagEmbedTitle || "No title",
          inline: true
        },
        {
          name: "Has Description",
          value: exists(tag.TagEmbedDescription),
          inline: true
        },
        {
          name: "Has Image",
          value: exists(tag.TagEmbedImageURL),
          inline: true
        },
        {
          name: "Has Footer",
          value: exists(tag.TagEmbedFooter),
          inline: true
        }
      ]
    }

    await interaction.editReply({ embeds: [embed] });
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
  name: InfoSubCommand.name,
  description: "Show information about a tag",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: "tag-name",
      description: "The name of the tag to get info for",
      type: ApplicationCommandOptionType.STRING,
      required: true,
      autocomplete: true
    }
  ]
};
