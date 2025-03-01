import { ApplicationCommandOptionType } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options } from '../../../Services/SettingsService';
import { chunk } from '../../../Common/array';

export const ViewTopicsSubCommand = defineSubCommand({
    name: 'view_topics',
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        await ctx.services.settings.configure<Options>({ guildId });
        const topicsExistInDB = await ctx.services.settings.getTopics<string>(guildId, 'Topics');

        const pages = chunk(topicsExistInDB, 10);
        const initialState = { addTopicPages: { page: 0, pages } };

        ctx.pagination.set(interaction.user.id, initialState);
        const state = ctx.pagination.get(interaction.user.id);

        if (!state || !state.addTopicPages) {
            await interaction.reply({
                content: 'Failed to initialize pagination state',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const components = [
            {
                type: ComponentType.ActionRow as const,
                components: [
                    {
                        type: ComponentType.Button as const,
                        customId: `add_topic_subcommand_button_previous_${interaction.user.id}`,
                        style: ButtonStyle.Primary as const,
                        label: 'Previous',
                        disabled: state.addTopicPages.page === 0,
                    },
                    {
                        type: ComponentType.Button as const,
                        customId: `add_topic_subcommand_button_home_${interaction.user.id}`,
                        style: ButtonStyle.Secondary as const,
                        label: 'Home',
                    },
                    {
                        type: ComponentType.Button as const,
                        customId: `add_topic_subcommand_button_next_${interaction.user.id}`,
                        style: ButtonStyle.Primary as const,
                        label: 'Next',
                        disabled: state.addTopicPages.page === state.addTopicPages.pages.length - 1,
                    },
                ],
            },
        ];

        await interaction.reply({
            embeds: [
                {
                    thumbnail: { url: interaction.guild.iconURL() ?? '' },
                    title: 'Current Topics in Configuration',
                    description:
                        state.addTopicPages.pages[state.addTopicPages.page]
                            .map(
                                (string, i) =>
                                    `**${state.addTopicPages.page * 10 + i + 1}.** *${string}*`,
                            )
                            .join('\n') || 'No topics',
                    footer: {
                        text: `Page: ${state.addTopicPages.page + 1}/${state.addTopicPages.pages.length} • Total Topics: ${topicsExistInDB.length}`,
                    },
                    color: global.embedColor,
                },
            ],
            components,
        });
    },
});

export const commandOptions = {
    name: 'view_topics',
    description: 'View the current topics in the configuration',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [],
};
