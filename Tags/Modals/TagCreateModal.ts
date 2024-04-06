import { Event, DefineEvent } from "../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../Context";
import { Emojis } from "../../Common/Emojis";
import { RegisterInteractionById } from "../../Common/RegisterInteractionById";
import { TagCreate, TagCreateOptions } from "../Controllers/TagCreate";
import { TagExists } from "../Controllers/TagExists";
export const TagCreateModal: Event = DefineEvent({
  event: {
    name: "interactionCreate",
    once: false
  },
  on: (interaction: ModalSubmitInteraction, ctx: Context) => {
    RegisterInteractionById({
      id: `tag_create_${interaction.user.id}`,
      ctx: ctx,
      interaction: interaction,
      typeguards: {
        negativeTypeGuards: ["isModalSubmit"]
      },
      callback: async (ctx: Context, interaction: ModalSubmitInteraction) => {
        const tagEmbedName: string = interaction.fields.getTextInputValue("tag_create_embed_name");
        const tagEmbedTitle: string = interaction.fields.getTextInputValue("tag_create_embed_title");
        const TagEmbedDescription: string = interaction.fields.getTextInputValue("tag_create_embed_description");
        const tagEmbedFooter: string = interaction.fields.getTextInputValue("tag_create_embed_footer");
        const tag: TagCreateOptions = {
          name: tagEmbedName,
          title: tagEmbedTitle,
          description: TagEmbedDescription ? TagEmbedDescription : null,
          footer: tagEmbedFooter ? tagEmbedFooter : null
        };
        if (await TagExists(interaction.guild.id, tag.name)) {
          return interaction.reply({ content: `> The support tag \`${tag.name}\` already exists!`, ephemeral: true });
        } else {
          await TagCreate(interaction.guild.id, { name: tag.name, title: tag.title, description: tag.description, footer: tag.footer })
          const embedObject: any = {};
          tag.description ? Object.defineProperty(embedObject, "description", { value: tag.description }) : Object.defineProperty(embedObject, "description", { value: null });
          tag.footer ? Object.defineProperty(embedObject, "footer", { value: { text: tag.footer }}) : Object.defineProperty(embedObject, "footer", { value: null });
          return interaction.reply({
            content: `${Emojis.CHECK_MARK} Successfully created \`${tag.name}\`!`,
            embeds: [
              {
                title: tag.title,
                color: 0xff9a00,
                description: embedObject?.description,
                footer: embedObject?.footer
              }
            ],
            ephemeral: true
          });
        };
      }
    })
  }
}) as Event;
