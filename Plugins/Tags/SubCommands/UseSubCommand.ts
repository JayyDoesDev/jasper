import { ApplicationCommandOptions, ApplicationCommandOptionType, } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { RegisterSubCommand } from "../../../Common/RegisterSubCommand";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { TagExists } from "../Controllers/TagExists";
import { TagGet } from "../Controllers/TagGet";
import { TagsGet } from "../Controllers/TagsGet";

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

export async function RunUseSubCommand(
    ctx: Context,
    interaction: ChatInputCommandInteraction | AutocompleteInteraction
) {
    await RegisterSubCommand<ChatInputCommandInteraction>({
        subCommand: "use",
        ctx: ctx,
        interaction: interaction,
        callback: async (
            ctx: Context,
            interaction
        ) => {
            const tagName: string = interaction.options.getString("tag-name");
            const mention: string = interaction.options.getUser("mention")?.id;

            if (await TagExists({ guildId: interaction.guild.id, name: tagName, ctx: ctx })) {
                const getTag = await TagGet({ name: tagName, guildId: interaction.guild.id, ctx: ctx });
                console.log(getTag)
                if (getTag) {
                    return interaction.reply({
                        content: mention ? `<@${ mention }>` : undefined,
                        embeds: [
                            {
                                color: 0xff9a00,
                                title: getTag.TagEmbedTitle,
                                description: getTag.TagEmbedDescription,
                                footer: {
                                    text: getTag.TagEmbedFooter,
                                },
                            },
                        ],
                    });
                }
            } else {
                return interaction.reply({
                    content: `> The support tag \`${ tagName }\` doesn't exist!`,
                    ephemeral: true,
                });
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
