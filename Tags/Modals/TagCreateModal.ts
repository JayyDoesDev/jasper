import { Event, DefineEvent } from "../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../Context";
import { Emojis } from "../../Common/Emojis";
import { RegisterInteractionById } from "../../Common/RegisterInteractionById";
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
        const tagEmbedTitle: string = interaction.fields.getTextInputValue("tag_create_embed_title");
        const TagEmbedDescription: string = interaction.fields.getTextInputValue("tag_create_embed_description");
        const tagEmbedFooter: string = interaction.fields.getTextInputValue("tag_create_embed_footer");

      }
    })
  }
}) as Event;
