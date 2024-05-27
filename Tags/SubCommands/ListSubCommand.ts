import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../Source/Context";
import { RegisterSubCommand } from "../../Common/RegisterSubCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { GuildExists } from "../../Common/GuildExists";
import TagSchema from "../../Models/TagSchema";
import { Wrap } from "../../Common/Wrap";

export const ListSubCommand: ApplicationCommandOptions = {
    name: "list",
    description: "Get the list of tags!",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: []
} as ApplicationCommandOptions;

export async function RunListSubCommand(ctx: Context, interaction: ChatInputCommandInteraction) {
    await RegisterSubCommand({
        subCommand: "list",
        ctx: ctx,
        interaction: interaction,
        callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            if (await GuildExists(interaction.guild.id)) {
                const tags = await Wrap(TagSchema.findOne({ _id: interaction.guild.id }));
                return interaction.reply({
                    content: tags.data.Tags.map((x, i) => `${ i + 1 }. ${ x.TagName }`).join("\n"),
                    ephemeral: true
                });
            } else {
                return interaction.reply({
                    content: "Couldn't find any tags for this guild!",
                    ephemeral: true
                });
            }
        }
    })
}
