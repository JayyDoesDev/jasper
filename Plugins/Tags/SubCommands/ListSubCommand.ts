import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { RegisterSubCommand } from "../../../Common/RegisterSubCommand";
import { ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
import { GuildExists } from "../../../Common/GuildExists";
import TagSchema from "../../../Models/TagSchema";
import { Wrap } from "../../../Common/Wrap";
import { Tag } from "../../../Models/TagDocument";
import { State } from "../../types";

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

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
                const dbtags = await Wrap(TagSchema.findOne({ _id: interaction.guild.id }));
                const tags: Tag[] = dbtags.data.Tags;
                const tagPages: Tag[][] = chunkArray(tags, 10);
                const userState: State = { page: 0, tagPages };

                await ctx.store.setUserKey({ user: interaction.user.id }, userState);

                return interaction.reply({
                    embeds: [
                      {
                        thumbnail: { url: interaction.guild.iconURL() },
                        title: `Server Tag List`,
                        description: userState.tagPages[userState.page].map((e, i) => `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : "None"}`).join("\n"),
                        footer: { text: `Page: ${userState.page + 1}/${userState.tagPages.length} • emojis by AnThOnY & deussa`},
                        color: 0x323338,
                      }
                    ],
                    components: [
                      {
                        type: ComponentType.ActionRow,
                        components: [
                          {
                            type: ComponentType.Button,
                            customId: `list_subcommand_button_previous_${interaction.user.id}`,
                            style: ButtonStyle.Primary,
                            emoji: "1268419004691779624",
                          },
                          {
                            type: ComponentType.Button,
                            customId: `list_subcommand_button_home_${interaction.user.id}`,
                            style: ButtonStyle.Secondary,
                            emoji: "1268421558066479214",
                          },
                          {
                            type: ComponentType.Button,
                            customId: `list_subcommand_button_next_${interaction.user.id}`,
                            style: ButtonStyle.Primary,
                            emoji: "1268418951407468556",
                          },
                        ]
                      }
                    ],
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
