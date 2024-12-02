import { DefineEvent } from "../../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../../Source/Context";
import { Emojis } from "../../../Common/Emojis";
import { RegisterInteractionById } from "../../../Common/RegisterInteractionById";
import { TagCreate } from "../Controllers/TagCreate";
import { TagExists } from "../Controllers/TagExists";
import { TagOptions } from "../Controllers/Types";
import { Combine } from "../../../Common/Combine";

export = {
  Event: DefineEvent({
    event: {
        name: "interactionCreate",
        once: false
    },
    on: (interaction: ModalSubmitInteraction, ctx: Context) => {
        RegisterInteractionById({
            id: `tag_create_${ interaction.user.id }`,
            ctx: ctx,
            interaction: interaction,
            typeguards: {
                negativeTypeGuards: [ "isModalSubmit" ]
            },
            callback: async (ctx: Context, interaction: ModalSubmitInteraction) => {
                const tag: TagOptions = {
                    author: interaction.user.id,
                    name: interaction.fields.getTextInputValue("tag_create_embed_name"),
                    title: interaction.fields.getTextInputValue("tag_create_embed_title"),
                    description: interaction.fields.getTextInputValue("tag_create_embed_description") ? interaction.fields.getTextInputValue("tag_create_embed_description") : null,
                    image_url: interaction.fields.getTextInputValue("tag_create_embed_image_url") ? interaction.fields.getTextInputValue("tag_create_embed_image_url") : null,
                    footer: interaction.fields.getTextInputValue("tag_create_embed_footer") ? interaction.fields.getTextInputValue("tag_create_embed_footer") : null
                };
                if (await TagExists({ guildId: interaction.guild.id, name: tag.name, ctx: ctx })) {
                    return interaction.reply({ content: `> The support tag \`${ tag.name }\` already exists!`, ephemeral: true });
                }
                if (tag.image_url && !/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(tag.image_url)) {
                    return interaction.reply({ content: `> The provided image link is not a valid image URL!`, ephemeral: true });
                }                                               
                else {
                    await TagCreate({ guildId: interaction.guild.id, options: { author: tag.author, name: tag.name, title: tag.title, description: tag.description, image_url: tag.image_url, footer: tag.footer }, ctx: ctx });
                    const embedObject: Partial<Combine<[Omit<TagOptions, "footer">, Record<"footer", Record<"text", string>>]>> = {};
                    tag.description ? embedObject["description"] = tag.description : embedObject["description"] = null;
                    tag.footer ? embedObject["footer"] = { text: tag.footer } : embedObject["footer"] = null;
                    return interaction.reply({
                        content: `${ Emojis.CHECK_MARK } Successfully created \`${ tag.name }\`!`,
                        embeds: [
                            {
                                title: tag.title,
                                color: 0x323338,
                                description: embedObject?.description,
                                image: tag.image_url ? { url: tag.image_url } : undefined,
                                footer: embedObject?.footer
                            }
                        ],
                        ephemeral: true
                    });
                }
            }
        })
    }
  })
}
