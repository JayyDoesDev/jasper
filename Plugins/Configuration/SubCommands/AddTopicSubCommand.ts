import { ApplicationCommandOptionType } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, SetTopicOptions } from '../../../Services/SettingsService';
import { chunk } from '../../../Common/array';

export const AddTopicSubCommand = defineSubCommand({
    name: 'add_topic',
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

        if (topicsExistInDB.includes(topic)) {
            await interaction.reply({
                content: `For the record, **${topic}** is already in the topics list.`,
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
            content: `I've added **${topic}** to the topics list.`,
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
                        text: `Page: ${state.addTopicPages.page + 1}/${state.addTopicPages.pages.length} • Total Topics: ${updatedTopics.length}`,
                    },
                    color: global.embedColor,
                },
            ],
            components,
            flags: MessageFlags.Ephemeral,
        });
    },
});

export const commandOptions = {
    name: 'add_topic',
    description: 'Add a new topic to the list of topics.',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'topic',
            description: 'The topic you want to add to the list.',
            type: ApplicationCommandOptionType.STRING,
            required: true,
        },
    ],
};
