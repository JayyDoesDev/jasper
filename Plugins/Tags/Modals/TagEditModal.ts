import { defineEvent } from "../../../Common/define";
import { MessageFlags, ModalSubmitInteraction } from "discord.js";
import { Context } from "../../../Source/Context";
import { Emojis } from "../../../Common/enums";
import { Options, TagResponse } from "../../../Services/TagService";
import { Tag } from "../../../Models/GuildSchema";

export = {
    Event: defineEvent({
        event: {
            name: "interactionCreate",
            once: false
        },
        on: async (interaction: ModalSubmitInteraction, ctx: Context) => {
            try {
                if (interaction.customId === `tag_edit_${interaction.user.id}`) {
                    if (!interaction.isModalSubmit()) return;
                    
                    const name = interaction.fields.getTextInputValue("tag_edit_embed_name");

                    const title = interaction.fields.getTextInputValue("tag_edit_embed_title").trim() || undefined;
                    const editedBy = interaction.user.id;
                    const description = interaction.fields.getTextInputValue("tag_edit_embed_description").trim() || null;
                    const image_url = interaction.fields.getTextInputValue("tag_edit_embed_image_url").trim() || null;
                    const footer = interaction.fields.getTextInputValue("tag_edit_embed_footer").trim() || null;

                    const guildId = interaction.guild.id;

                    if (!(await ctx.services.tags.itemExists<Options>({ guildId, name }))) {
                        return interaction.reply({ content: `> The support tag \`${name}\` doesn't exist!`, flags: MessageFlags.Ephemeral });
                    }

                    if (image_url && !/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(image_url)) {
                        return interaction.reply({ content: `> The provided image link is not a valid image URL!`, flags: MessageFlags.Ephemeral });
                    }

                    await ctx.services.tags.modify<Options & { tag?: Tag }, void>({ guildId, name, tag: { name, title, editedBy, description, image_url, footer } });

                    const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = await ctx.services.tags.getValues<Options, TagResponse>({ guildId, name });

                    return interaction.reply({
                        content: `${Emojis.CHECK_MARK} Successfully edited \`${name}\`!`,
                        embeds: [
                            {
                                title: TagEmbedTitle,
                                color: 0x323338,
                                description: TagEmbedDescription,
                                image: { url: TagEmbedImageURL ?? undefined },
                                footer: { text: TagEmbedFooter }
                            }
                        ],
                        flags: MessageFlags.Ephemeral
                    })
                }
            }
            catch (error) {
                throw ('Error on TagEditModal ' + error.stack || error);
            }
        }
    })
}