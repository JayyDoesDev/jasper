import { DefineEvent } from "../../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../../Source/Context";
import { Emojis } from "../../../Common/Emojis";
import { TagResponse } from "../Controllers/Types";
import { Options } from "../../../Controllers/TagController";
import { Tag } from "../../../Models/GuildDocument";

export = {
    Event: DefineEvent({
        event: {
            name: "interactionCreate",
            once: false
        },
        on: async (interaction: ModalSubmitInteraction, ctx: Context) => {
            if (interaction.customId === `tag_edit_${interaction.user.id}`) {
                if (!interaction.isModalSubmit()) {
                    return;
                }
            }

            const name = interaction.fields.getTextInputValue("tag_edit_embed_name");
            const title = interaction.fields.getTextInputValue("tag_edit_embed_title");
            const editedBy = interaction.user.id;
            const description = interaction.fields.getTextInputValue("tag_edit_embed_description");
            const image_url = interaction.fields.getTextInputValue("tag_edit_embed_image_url");
            const footer = interaction.fields.getTextInputValue("tag_edit_embed_footer");

            const guildId = interaction.guild.id;

            if (!(await ctx.controllers.tags.itemExists<Options>({ guildId, name }))) {
                return interaction.reply({ content: `> The support tag \`${name}\` doesn't exist!`, ephemeral: true });
            }

            if (image_url && !/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(image_url)) {
                return interaction.reply({ content: `> The provided image link is not a valid image URL!`, ephemeral: true })
            }

            await ctx.controllers.tags.modify<Options & { tag?: Tag }, void>({ guildId, name, tag: { name, title, editedBy, description, image_url, footer } });

            const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = await ctx.controllers.tags.getValues<Options, TagResponse>({ guildId, name });

            return interaction.reply({ 
                content: `${Emojis.CHECK_MARK} Successfully edited \`${name}\`!` ,
                embeds: [
                    {
                        title: TagEmbedTitle,
                        color: 0x323338,
                        description: TagEmbedDescription,
                        image: { url: TagEmbedImageURL ?? undefined },
                        footer: { text: TagEmbedFooter}
                    }
                ]
            })
        }
    })
}
