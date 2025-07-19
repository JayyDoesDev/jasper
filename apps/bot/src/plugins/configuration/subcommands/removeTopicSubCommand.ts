import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const RemoveTopicSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('topic') || '';
        const filtered = (
            await ctx.services.settings.getText<string>(interaction.guildId!, 'Topics')
        )
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const input = interaction.options.getString('topic')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const topicsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Topics');

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

        const index = Number(input);
        let topic = topicsExistInDB[Number(index) - 1];

        if (Number.isNaN(index)) {
            topic = input;
        } else {
            if (!topicsExistInDB[index - 1] || index <= 0 || index > topicsExistInDB.length) {
                await interaction.reply({
                    content: `I couldn't find a topic at index **${index}**`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        await ctx.services.settings.removeText<SetTextOptions>({
            guildId,
            key: 'Topics',
            values: topic,
        });

        const updatedTopics = await ctx.services.settings.getText<string>(guildId, 'Topics');

        const updatedPages = chunk(updatedTopics, 10);
        state.addTopicPages.pages = updatedPages;
        state.addTopicPages.page = Math.min(state.addTopicPages.page, updatedPages.length - 1);

        await interaction.reply({
            components,
            content: `I've removed **${topic}** from the topics list.`,
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

    name: 'remove_topic',
});

export const commandOptions = {
    description: 'Remove a topic from the configuration',
    name: 'remove_topic',
    options: [
        {
            autocomplete: true,
            description: 'Provide either the index position or name of the topic to remove',
            name: 'topic',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
