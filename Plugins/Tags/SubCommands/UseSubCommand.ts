import { ApplicationCommandOptions, ApplicationCommandOptionType, Snowflake, } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { Options, TagResponse } from "../../../Services/TagService";

export const UseSubCommand: ApplicationCommandOptions = {
    name: "use",
    description: "Use a tag!",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: "tag-name",
            description: "Provide the name of the tag you would like to check out!",
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: "mention",
            description: "Mention the user you would like to use the tag on!",
            type: ApplicationCommandOptionType.USER,
            required: false,
        },
    ],
} as ApplicationCommandOptions;

export async function use(
    ctx: Context,
    interaction: ChatInputCommandInteraction | AutocompleteInteraction
) {
    if (interaction.isChatInputCommand()) {
        if (interaction.options.getSubcommand() === UseSubCommand.name) {
            const guildId = interaction.guild.id;
            const name = interaction.options.getString('tag-name');
            const mention = interaction.options.getUser('mention')?.id;

            await ctx.services.tags.configure<Options>({ guildId, name });

            const exists = await ctx.services.tags.itemExists<Options>();

            if (!exists) return interaction.reply({ content: 'Tag not found!', ephemeral: true });


            const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = await ctx.services.tags.getValues<Options, TagResponse>();

            return interaction.reply({
                content: mention ? `<@${mention}>` : undefined,
                embeds: [
                    {
                        title: TagEmbedTitle,
                        color: global.embedColor,
                        description: TagEmbedDescription,
                        image: TagEmbedImageURL ? { url: TagEmbedImageURL } : undefined,
                        footer: {
                            text: TagEmbedFooter ?? ''
                        }
                    }
                ],
                ephemeral: true
            })
        }
    }

    if (interaction.isAutocomplete()) {
        if (interaction.options.getSubcommand() === UseSubCommand.name) {
            const focus = interaction.options.getFocused();

            const tags = await ctx.services.tags.getMultiValues<Snowflake, TagResponse[]>(interaction.guild.id);
            const filteredTags = focus.length > 0 ? tags.filter((tag) => tag.TagName.toLowerCase().includes(focus.toLowerCase())) : tags;

            await interaction.respond(filteredTags.map((tag) => ({ name: tag.TagName, value: tag.TagName })).slice(0, 20));
        }
    }
}
