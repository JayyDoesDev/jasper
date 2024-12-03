import { DefineEvent } from "../../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../../Source/Context";
import { Emojis } from "../../../Common/Emojis";
import { RegisterInteractionById } from "../../../Common/RegisterInteractionById";
import { TagEdit } from "../Controllers/TagEdit";
import { TagExists } from "../Controllers/TagExists";
import { TagGet } from "../Controllers/TagGet";
import { TagOptions, TagResponse } from "../Controllers/Types";
import { Combine } from "../../../Common/Combine";

export = {
    Event: DefineEvent({
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
                    const tag: TagOptions = {
                        name: interaction.fields.getTextInputValue("tag_edit_embed_name"),
                        title: interaction.fields.getTextInputValue("tag_edit_embed_title"),
                        description: interaction.fields.getTextInputValue("tag_edit_embed_description") ? interaction.fields.getTextInputValue("tag_edit_embed_description") : null,
                        image_url: interaction.fields.getTextInputValue("tag_edit_embed_image_url") ? interaction.fields.getTextInputValue("tag_edit_embed_image_url") : null,
                        footer: interaction.fields.getTextInputValue("tag_edit_embed_footer") ? interaction.fields.getTextInputValue("tag_edit_embed_footer") : null
                    };
                    if (tag.image_url && !/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(tag.image_url)) {
                        return interaction.reply({ content: `> The provided image link is not a valid image URL!`, ephemeral: true });
                    }
                    if (await TagExists({ guildId: interaction.guild.id, name: tag.name, ctx: ctx })) {
                        await TagEdit({ guildId: interaction.guild.id, options: { editedBy: interaction.user.id, name: tag.name, title: tag.title, description: tag.description, image_url: tag.image_url, footer: tag.footer }, ctx: ctx })
                        const getTag: TagResponse = await TagGet({ name: tag.name, guildId: interaction.guild.id, ctx: ctx });

                        const embedObject: Partial<Combine<[Omit<TagOptions, "footer">, Record<"footer", Record<"text", string>>]>> = {};
                        tag.description ? embedObject["description"] = tag.description : embedObject["description"] = getTag.TagEmbedDescription;
                        tag.footer ? embedObject["footer"] = { text: tag.footer } : embedObject["footer"] = { text: getTag.TagEmbedFooter };

                        return interaction.reply({
                            content: `${Emojis.CHECK_MARK} Successfully edited \`${tag.name}\`!`,
                            embeds: [
                                {
                                    title: tag.title || getTag.TagEmbedTitle,
                                    color: 0x323338,
                                    description: embedObject?.description,
                                    image: tag.image_url ? { url: tag.image_url } : undefined,
                                    footer: embedObject?.footer
                                }
                            ],
                            ephemeral: true
                        });
                    } else {
                        return interaction.reply({ content: `> The support tag \`${tag.name}\` doesn't exist!`, ephemeral: true });
                    }
                }
            })
        }
    })
}
