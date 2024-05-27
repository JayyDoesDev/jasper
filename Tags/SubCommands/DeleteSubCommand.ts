import { Context } from "../../Context";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { TagExists } from "../Controllers/TagExists";
import { TagDelete } from "../Controllers/TagDelete";
import { Emojis } from "../../Common/Emojis";
import { TagsGet } from "../Controllers/TagsGet";

export const DeleteSubCommand: ApplicationCommandOptions = {
    name: "delete",
    description: "Delete a tag!",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: "tag-name",
            description: "Provide the tag name of the tag you would like to delete!",
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true
        }
    ]
} as ApplicationCommandOptions;

export async function RunDeleteSubCommand(ctx: Context, interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    await RegisterSubCommand({
        subCommand: "delete",
        ctx: ctx,
        interaction: interaction,
        callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            const tagName: string = interaction.options.getString("tag-name");
            if (await TagExists(interaction.guild.id, tagName, ctx)) {
                await TagDelete(interaction.guild.id, tagName, ctx);
                return interaction.reply({
                    content: `${ Emojis.CHECK_MARK } Successfully deleted \`${ tagName }\`!`,
                    ephemeral: true
                })
            } else {
                return interaction.reply({
                    content: `Tag not found!`,
                    ephemeral: true
                })
            }
        },
        autocomplete: async (ctx, interaction) => {
            const focus = interaction.options.getFocused();
            const tags = await TagsGet(interaction.guild.id, ctx);

            const filteredTags = focus.length > 0 ? tags.filter((x) => x.TagName.toLowerCase().includes(focus.toLowerCase())) : tags;
            await interaction.respond(filteredTags.map((x) => ({
                    name: x.TagName,
                    value: x.TagName,
                })
            ).slice(0, 20));
        }
    });
}
