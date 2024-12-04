import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { RegisterSubCommand } from "../../../Common/RegisterSubCommand";
import { AttachmentBuilder, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { TagExists } from "../Controllers/TagExists";
import { TagGet } from "../Controllers/TagGet";
import { TagsGet } from "../Controllers/TagsGet";

export const RawSubCommand: ApplicationCommandOptions = {
    name: "raw",
    description: "Get the raw content of a tag as a text attachment file.",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: "tag-name",
            description: "Provide the name of the tag you would like to get as text attachment file!",
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true
        }
    ]
} as ApplicationCommandOptions;

export async function RunRawSubCommand(ctx: Context, interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    await RegisterSubCommand({
        subCommand: "raw",
        ctx: ctx,
        interaction: interaction,
        callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            try {
                const tagName: string = interaction.options.getString("tag-name");

                if (await TagExists({ guildId: interaction.guild.id, name: tagName, ctx: ctx })) {
                    const getTag = await TagGet({ name: tagName, guildId: interaction.guild.id, ctx: ctx });

                    const separator = "—————————————————————————————————————————";
                    const fileContent = [
                        separator.repeat(2),
                        "TAG NAME:",
                        getTag.TagName || "None",
                        separator.repeat(2),
                        "TAG TITLE:",
                        getTag.TagEmbedTitle || "None",
                        separator.repeat(2),
                        "TAG DESCRIPTION:",
                        getTag.TagEmbedDescription || "None",
                        separator.repeat(2),
                        "TAG IMAGE URL:",
                        getTag.TagEmbedImageURL || "None",
                        separator.repeat(2),
                        "TAG FOOTER:",
                        getTag.TagEmbedFooter || "None",
                        separator.repeat(2),
                    ].join("\n");

                    const attachment = new AttachmentBuilder(Buffer.from(fileContent, "utf-8"), {
                        name: `${getTag.TagName}.txt`,
                    });

                    return interaction.reply({
                        content: `Here is the raw content of the tag \`${tagName}\`:`,
                        files: [attachment],
                        ephemeral: true,
                    });
                } else {
                    return interaction.reply({ content: `> The tag \`${tagName}\` doesn't exist!`, ephemeral: true, });
                }
            }
            catch (error) {
                console.error(error.stack);
            }
        },
        autocomplete: async (ctx, interaction) => {
            const focus = interaction.options.getFocused();
            const tags = await TagsGet(interaction.guild.id, ctx);

            const filteredTags = focus.length > 0 ? tags.filter((x) => x.TagName.toLowerCase().includes(focus.toLowerCase())) : tags;
            await interaction.respond(
                filteredTags.map((x) => ({
                    name: x.TagName,
                    value: x.TagName,
                })).slice(0, 20)
            );
        },
    });
}
