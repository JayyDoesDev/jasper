import { Event, DefineEvent } from "../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../Context";
import { Emojis } from "../../Common/Emojis";
import { RegisterInteractionById } from "../../Common/RegisterInteractionById";
import { TagEdit, TagEditOptions } from "../Controllers/TagEdit";
import { TagExists } from "../Controllers/TagExists";
import { TagGet } from "../Controllers/TagGet";
export const TagEditModal: Event = DefineEvent({
  event: {
    name: "interactionCreate",
    once: false
  },
  on: (interaction: ModalSubmitInteraction, ctx: Context) => {
    RegisterInteractionById({
      id: `tag_edit_${interaction.user.id}`,
      ctx: ctx,
      interaction: interaction,
      typeguards: {
        negativeTypeGuards: ["isModalSubmit"]
      },
      callback: async (ctx: Context, interaction: ModalSubmitInteraction) => {
        const tagEmbedName: string = interaction.fields.getTextInputValue("tag_edit_embed_name");
        const tagEmbedTitle: string = interaction.fields.getTextInputValue("tag_edit_embed_title");
        const TagEmbedDescription: string = interaction.fields.getTextInputValue("tag_edit_embed_description");
        const tagEmbedFooter: string = interaction.fields.getTextInputValue("tag_edit_embed_footer");
        const tag: TagEditOptions = {
          name: tagEmbedName,
          title: tagEmbedTitle,
          description: TagEmbedDescription ? TagEmbedDescription : null,
          footer: tagEmbedFooter ? tagEmbedFooter : null
        };
        if (await TagExists(interaction.guild.id, tag.name)) {
          await TagEdit(interaction.guild.id, { name: tag.name, title: tag.title, description: tag.description, footer: tag.footer });
          const getTag = await TagGet(tag.name, interaction.guild.id);
          const embedObject: any = {};
          tag.description ? Object.defineProperty(embedObject, "description", { value: tag.description }) : Object.defineProperty(embedObject, "description", { value: getTag.TagEmbedDescription });
          tag.footer ? Object.defineProperty(embedObject, "footer", { value: { text: tag.footer } }) : Object.defineProperty(embedObject, "footer", { value: { text: getTag.TagEmbedFooter } });
          return interaction.reply({
            content: `${Emojis.CHECK_MARK} Successfully edited \`${tag.name}\`!`,
            embeds: [
              {
                title: tag.title || getTag.TagEmbedTitle,
                color: 0xff9a00,
                description: embedObject?.description,
                footer: embedObject?.footer
              }
            ],
            ephemeral: true
          });
        } else {
          return interaction.reply({ content: `> The support tag \`${tag.name}\` doesn't exists!`, ephemeral: true });
        };
      }
    })
  }
}) as Event;
