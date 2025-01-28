import { ApplicationCommandOptions, ApplicationCommandOptionType, Snowflake } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from "discord.js";
import { Tag } from "../../../Models/GuildSchema";

interface PaginationState {
    page: number;
    tagPages: Tag[][];
}

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

export async function list(ctx: Context, interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() !== ListSubCommand.name) return;

    const guildId = interaction.guild.id;
    const tags = await ctx.services.tags.getMultiValues<Snowflake, Tag[]>(guildId) ?? [];

    if (tags.length === 0) {
        return interaction.reply({ 
            content: 'No tags found in this guild!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    const tagPages = chunkArray<Tag>(tags, 10);
    const initialState: PaginationState = { page: 0, tagPages };
    
    ctx.pagination.set(interaction.user.id, initialState);
    const state = ctx.pagination.get(interaction.user.id);

    if (!state) {
        return interaction.reply({ 
            content: 'Failed to initialize pagination state', 
            flags: MessageFlags.Ephemeral 
        });
    }

    return interaction.reply({
        embeds: [
            {
                thumbnail: { url: interaction.guild.iconURL() ?? undefined },
                title: `Server Tag List`,
                description: state.tagPages[state.page]
                    .map((e, i) => `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : "None"}`)
                    .join("\n"),
                footer: { text: `Page: ${state.page + 1}/${state.tagPages.length} • Total Tags: ${tags.length}` },
                color: global.embedColor = 0x323338,
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
                        label: 'Previous',
                        disabled: state.page === 0
                    },
                    {
                        type: ComponentType.Button,
                        customId: `list_subcommand_button_home_${interaction.user.id}`,
                        style: ButtonStyle.Secondary,
                        label: 'Home'
                    },
                    {
                        type: ComponentType.Button,
                        customId: `list_subcommand_button_next_${interaction.user.id}`,
                        style: ButtonStyle.Primary,
                        label: 'Next',
                        disabled: state.page === state.tagPages.length - 1
                },
              ]
            }
          ],
          flags: MessageFlags.Ephemeral
      });

}
