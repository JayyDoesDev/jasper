import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTopicOptions } from '../../../services/settingsService';

export const AddTopicSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const topic = interaction.options.getString('topic')!;

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
                components: [
                    {
                        customId: `add_topic_subcommand_button_previous_${interaction.user.id}`,
                        disabled: state.addTopicPages.page === 0,
                        label: 'Previous',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_topic_subcommand_button_home_${interaction.user.id}`,
                        label: 'Home',
                        style: ButtonStyle.Secondary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_topic_subcommand_button_next_${interaction.user.id}`,
                        disabled: state.addTopicPages.page === state.addTopicPages.pages.length - 1,
                        label: 'Next',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                ],
                type: ComponentType.ActionRow as const,
            },
        ];

        if (topicsExistInDB.includes(topic)) {
            await interaction.reply({
                components,
                content: `For the record, **${topic}** is already in the topics list.`,
                embeds: [
                    {
                        color: global.embedColor,
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
                        thumbnail: { url: interaction.guild.iconURL() ?? '' },
                        title: 'Current Topics in Configuration',
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setTopics<SetTopicOptions>({
            guildId,
            ...{ key: 'Topics', topics: topic },
        });

        const updatedTopics = await ctx.services.settings.getTopics<string>(guildId, 'Topics');
        const updatedPages = chunk(updatedTopics, 10);
        state.addTopicPages.pages = updatedPages;

        await interaction.reply({
            components,
            content: `I've added **${topic}** to the topics list.`,
            embeds: [
                {
                    color: global.embedColor,
                    description:
                        state.addTopicPages.pages[state.addTopicPages.page]
                            .map(
                                (string, i) =>
                                    `**${state.addTopicPages.page * 10 + i + 1}.** *${string}*`,
                            )
                            .join('\n') || 'No topics',
                    footer: {
                        text: `Page: ${state.addTopicPages.page + 1}/${state.addTopicPages.pages.length} • Total Topics: ${updatedTopics.length}`,
                    },
                    thumbnail: { url: interaction.guild.iconURL() ?? '' },
                    title: 'Current Topics in Configuration',
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'add_topic',
});

export const commandOptions = {
    description: 'Add a new topic to the list of topics.',
    name: 'add_topic',
    options: [
        {
            description: 'The topic you want to add to the list.',
            name: 'topic',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
