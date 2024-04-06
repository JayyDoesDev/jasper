import { ApplicationCommandOptionType, ApplicationCommandOptions, ApplicationCommandType, PermissionBitToString, Permissions } from "@antibot/interactions";
import { Context } from "../../Context";
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
export const CreateSubCommand: ApplicationCommandOptions = {
  name: "create",
  description: "Create a tag!",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: []
} as ApplicationCommandOptions;

export function RunCreateSubCommand(ctx: Context, interaction: ChatInputCommandInteraction): void {
  RegisterSubCommand({
    subCommand: "create",
    ctx: ctx,
    interaction: interaction,
    callback: async (ctx, Context, interaction: ChatInputCommandInteraction) => {
      const modal: ModalBuilder = new ModalBuilder()
        .setCustomId(`tag_create_${interaction.user.id}`)
        .setTitle("Support Tag Create");
      const tagEmbedTitle: TextInputBuilder = new TextInputBuilder()
        .setLabel("Embed Title")
        .setMaxLength(200)
        .setRequired(true);
      const TagEmbedDescription: TextInputBuilder = new TextInputBuilder()
        .setLabel("Embed Description")
        .setMaxLength(3000)
        .setRequired(false);
      const TagEmbedFooter: TextInputBuilder = new TextInputBuilder()
        .setLabel("Embed Footer")
        .setMaxLength(40)
        .setRequired(false);
      const tagEmbedTitleRow: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(tagEmbedTitle);
      const TagEmbedDescriptionRow: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(TagEmbedDescription);
      const tagEmbedFooterRow: ActionRowBuilder<TextInputBuilder> = new ActionRowBuilder<TextInputBuilder>().addComponents(TagEmbedFooter);
      modal.addComponents(tagEmbedTitleRow, TagEmbedDescriptionRow, tagEmbedFooterRow);
      await interaction.showModal(modal);
    }
  });
};
