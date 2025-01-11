/* eslint @typescript-eslint/no-explicit-any: "off" */
import { ApplicationCommandOptions, ApplicationCommandOptionType, Snowflake } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { AutocompleteInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
import { TagResponse } from "../Controllers/Types";
import { checkForRoles } from "../../../Common/roles";
import { Options } from "../../../Services/TagService";

export const InfoSubCommand: ApplicationCommandOptions = {
    name: "info",
    description: "Get the info of a tag!",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: "tag-name",
            description: "Provide the tag name of the tag you would like to check!",
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true
        }
    ]
} as ApplicationCommandOptions;

export async function RunInfoSubCommand(ctx: Context, interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
    if (interaction.isChatInputCommand()) {
        if (interaction.options.getSubcommand() === InfoSubCommand.name) {
            const guildId = interaction.guild.id;
            const name = interaction.options.getString('tag-name');
            const author = interaction.user.id;

            await ctx.services.tags.configure<Options>({ guildId, name });

            const exists = await ctx.services.tags.itemExists<Options>();

            if (!exists) return interaction.reply({ content: 'Tag not found!', ephemeral: true });

            const { TagName, TagAuthor, TagEditedBy } = await ctx.services.tags.getValues<Options, TagResponse>();

            const buttons = [
                {
                    type: ComponentType.Button,
                    label: 'Raw',
                    customId: `raw_info_subcommand_${TagName}_${author}`,
                    style: ButtonStyle.Primary,
                    disabled: false
                },
                {
                    type: ComponentType.Button,
                    label: 'Edit',
                    customId: `edit_info_subcommand_${TagName}_${author}`,
                    style: ButtonStyle.Primary,
                    disabled: false
                },
                {
                    type: ComponentType.Button,
                    label: 'Delete',
                    customId: `delete_info_subcommand_${TagName}_${author}`,
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ];

            if (!checkForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE)) {
                for (const button of buttons) {
                    if (button.label == 'Delete') {
                        button.disabled = true;
                    }
                }
            }

            return interaction.reply({
                embeds: [
                    {
                        title: TagName,
                        color: global.embedColor,
                        description: `> **Created by ${TagAuthor ? `<@${TagAuthor}>` : "Unknown"}**\n**> Edited by ${TagEditedBy ? `<@${TagEditedBy}>` : "No one"}**`
                    }
                ],
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [...<any>buttons]
                    }
                ],
                ephemeral: true
            })

        }
    }

    if (interaction.isAutocomplete()) {
        if (interaction.options.getSubcommand() === InfoSubCommand.name) {
            const focus = interaction.options.getFocused();

            const tags = await ctx.services.tags.getMultiValues<Snowflake, TagResponse[]>(interaction.guild.id);
            const filteredTags = focus.length > 0 ? tags.filter((tag) => tag.TagName.toLowerCase().includes(focus.toLowerCase())) : tags;

            await interaction.respond(filteredTags.map((tag) => ({ name: tag.TagName, value: tag.TagName })).slice(0, 20));
        }
    }
}
