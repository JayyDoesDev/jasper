import { Context } from "../../../Source/Context";
import { ApplicationCommandOptions, ApplicationCommandOptionType, Snowflake } from "@antibot/interactions";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { Emojis } from "../../../Common/Emojis";
import { Options, TagResponse } from "../../../Controllers/TagController";

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
    if (interaction.isChatInputCommand()) {
        if (interaction.options.getSubcommand() === DeleteSubCommand.name) {
            const guildId = interaction.guild.id;
            const name = interaction.options.getString('tag-name');

            await ctx.controllers.tags.configure<Options>({ guildId, name });

            const isDeleted = await ctx.controllers.tags.delete<Options, boolean>();

            if (isDeleted) return interaction.reply({ content: `${Emojis.CHECK_MARK} Successfully deleted \`${name}\`!`, ephemeral: true });

            return interaction.reply({ content: 'Tag not found!', ephemeral: true });
        }
    }

    if (interaction.isAutocomplete()) {
        if (interaction.options.getSubcommand() === DeleteSubCommand.name) {
            const focus = interaction.options.getFocused();
            
            const tags = await ctx.controllers.tags.getMultiValues<Snowflake, TagResponse[]>(interaction.guild.id);
            const filteredTags = focus.length > 0 ? tags.filter((tag) => tag.TagName.toLowerCase().includes(focus.toLowerCase())) : tags;

            await interaction.respond(filteredTags.map((tag) => ({ name: tag.TagName, value: tag.TagName })).slice(0, 20));
        }
    }
}
