import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const AddActionSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const action = interaction.options.getString('action')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const actionsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Actions');

        const pages = chunk(actionsExistInDB, 10);
        const initialState = { addActionPages: { page: 0, pages } };

        ctx.pagination.set(interaction.user.id, initialState);
        const state = ctx.pagination.get(interaction.user.id);

        if (!state || !state.addActionPages) {
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
                        customId: `add_action_subcommand_button_previous_${interaction.user.id}`,
                        disabled: state.addActionPages.page === 0,
                        label: 'Previous',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_action_subcommand_button_home_${interaction.user.id}`,
                        label: 'Home',
                        style: ButtonStyle.Secondary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_action_subcommand_button_next_${interaction.user.id}`,
                        disabled:
                            state.addActionPages.page === state.addActionPages.pages.length - 1,
                        label: 'Next',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                ],
                type: ComponentType.ActionRow as const,
            },
        ];

        if (actionsExistInDB.includes(action)) {
            await interaction.reply({
                components,
                content: `For the record, **${action}** is already in the actions list.`,
                embeds: [
                    {
                        color: global.embedColor,
                        description:
                            state.addActionPages.pages[state.addActionPages.page]
                                .map(
                                    (string, i) =>
                                        `**${state.addActionPages.page * 10 + i + 1}.** *${string}*`,
                                )
                                .join('\n') || 'No actions',
                        footer: {
                            text: `Page: ${state.addActionPages.page + 1}/${state.addActionPages.pages.length} • Total actions: ${actionsExistInDB.length}`,
                        },
                        thumbnail: { url: interaction.guild.iconURL() ?? '' },
                        title: 'Current actions in Configuration',
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setText<SetTextOptions>({
            guildId,
            ...{ key: 'Actions', values: action },
        });

        const updatedActions = await ctx.services.settings.getText<string>(guildId, 'Actions');
        const updatedPages = chunk(updatedActions, 10);
        state.addActionPages.pages = updatedPages;

        await interaction.reply({
            components,
            content: `I've added **${action}** to the actions list.`,
            embeds: [
                {
                    color: global.embedColor,
                    description:
                        state.addActionPages.pages[state.addActionPages.page]
                            .map(
                                (string, i) =>
                                    `**${state.addActionPages.page * 10 + i + 1}.** *${string}*`,
                            )
                            .join('\n') || 'No actions',
                    footer: {
                        text: `Page: ${state.addActionPages.page + 1}/${state.addActionPages.pages.length} • Total actions: ${updatedActions.length}`,
                    },
                    thumbnail: { url: interaction.guild.iconURL() ?? '' },
                    title: 'Current Actions in Configuration',
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'add_action',
});

export const commandOptions = {
    description: 'Add a new action to the list for the act command.',
    name: 'add_action',
    options: [
        {
            description: 'The action you want to add to the list.',
            name: 'action',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
