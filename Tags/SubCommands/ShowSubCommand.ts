import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../Source/Context";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { TagExists } from "../Controllers/TagExists";
import { TagGet } from "../Controllers/TagGet";
import { TagsGet } from "../Controllers/TagsGet";

export const ShowSubCommand: ApplicationCommandOptions = {
    name: "show",
    description: "Show a tag!",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: "tag-name",
            description: "Provide the name of the tag you would like to check out!",
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true
        }
    ]
} as ApplicationCommandOptions;

export async function RunShowSubCommand(ctx: Context, interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    await RegisterSubCommand({
        subCommand: "show",
        ctx: ctx,
        interaction: interaction,
        callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            const tagName: string = interaction.options.getString("tag-name");
            if (await TagExists(interaction.guild.id, tagName, ctx)) {
                const getTag: any = await TagGet(tagName, interaction.guild.id, ctx);
                return interaction.reply({
                    embeds: [
                        {
                            title: getTag.TagEmbedTitle,
                            color: 0xff9a00,
                            description: getTag.TagEmbedDescription ? getTag.TagEmbedDescription : '',
                            footer: {
                                text: getTag.TagEmbedFooter ? getTag.TagEmbedFooter : ''
                            }
                        }
                    ],
                    ephemeral: true
                })
            } else {
                return interaction.reply({ content: `> The support tag \`${ tagName }\` doesn't exists!`, ephemeral: true });
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
