import { ApplicationCommandOptions, ApplicationCommandOptionType, Snowflake } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
import { Tag } from "../../../Models/GuildDocument";

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
    if (interaction.isChatInputCommand()) {
      if (interaction.options.getSubcommand() === ListSubCommand.name) {
        const guildId = interaction.guild.id;

        const tags = await ctx.controllers.tags.getMultiValues<Snowflake, Tag[]>(guildId);

        if (!tags || tags.length === 0) return interaction.reply({ content: 'Couldn\'t find any tags for this guild!', ephemeral: true });

        const tagPages = chunkArray(tags, 10);

        ctx.pagination.set(interaction.user.id, { page: 0, tagPages });

        const state = ctx.pagination.get(interaction.user.id);

        return interaction.reply({
          embeds: [
            {
              thumbnail: { url: interaction.guild.iconURL() },
              title: `Server Tag List`,
              description: state.tagPages[state.page].map((e, i) => `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : "None"}`).join("\n"),
              footer: { text: `Page: ${state.page + 1}/${state.tagPages.length} • emojis by AnThOnY & deussa`},
              color: global.embedColor,
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

      }
    }
}
