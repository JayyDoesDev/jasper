import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, ComponentType, TextInputStyle } from "discord.js";
import { RegisterSubCommand } from "../../../Common/RegisterSubCommand";

export const CreateSubCommand: ApplicationCommandOptions = {
  name: "create",
  description: "Create a tag!",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: []
} as ApplicationCommandOptions;

export async function RunCreateSubCommand(ctx: Context, interaction: ChatInputCommandInteraction) {
  await RegisterSubCommand({
    subCommand: "create",
    ctx: ctx,
    interaction: interaction,
    callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {

      await interaction.showModal(
        {
          customId: `tag_create_${interaction.user.id}`,
          title: "Create a support tag",
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "tag_create_embed_name",
                  label: "Tag",
                  placeholder: "support",
                  maxLength: 80,
                  style: TextInputStyle.Short,
                  required: true
                }
              ]
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "tag_create_embed_title",
                  label: "Embed Title",
                  placeholder: "How do I contact support?",
                  maxLength: 200,
                  style: TextInputStyle.Short,
                  required: true
                }
              ]
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "tag_create_embed_description",
                  label: "Embed Description",
                  placeholder: "You can contact us in the support threads!",
                  maxLength: 3000,
                  style: TextInputStyle.Paragraph,
                  required: false
                }
              ]
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "tag_create_embed_image_url",
                  label: "Embed Image URL",
                  placeholder: "https://i.pinimg.com/originals/ba/92/7f/ba927ff34cd961ce2c184d47e8ead9f6.jpg",
                  maxLength: 500,
                  style: TextInputStyle.Short,
                  required: false
                }
              ]
            },
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.TextInput,
                  customId: "tag_create_embed_footer",
                  label: "Embed Footer",
                  placeholder: "Make sure to be patient!",
                  maxLength: 40,
                  style: TextInputStyle.Short,
                  required: false
                }
              ]
            }
          ]
        }
      );
    }
  });
}
