import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetActionOptions } from '../../../services/settingsService';

export const RemoveActionSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('action') || '';
        const filtered = (
            await ctx.services.settings.getActions<string>(interaction.guildId!, 'Actions')
        )
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const input = interaction.options.getString('action')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const actionsExistInDB = await ctx.services.settings.getActions<string>(guildId, 'Actions');

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
                        disabled: state.addActionPages.page === state.addActionPages.pages.length - 1,
                        label: 'Next',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                ],
                type: ComponentType.ActionRow as const,
            },
        ];

        const index = Number(input);
        let action = actionsExistInDB[Number(index) - 1];

        if (Number.isNaN(index)) {
            action = input;
        } else {
            if (!actionsExistInDB[index - 1] || index <= 0 || index > actionsExistInDB.length) {
                await interaction.reply({
                    content: `I couldn't find an action at index **${index}**`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        await ctx.services.settings.removeActions<SetActionOptions>({
            actions: action,
            guildId,
            key: 'Actions',
        });

        const updatedActions = await ctx.services.settings.getActions<string>(guildId, 'Actions');

        const updatedPages = chunk(updatedActions, 10);
        state.addActionPages.pages = updatedPages;
        state.addActionPages.page = Math.min(state.addActionPages.page, updatedPages.length - 1);

        await interaction.reply({
            components,
            content: `I've removed **${action}** from the actions list.`,
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
                        text: `Page: ${state.addActionPages.page + 1}/${state.addActionPages.pages.length} • Total Actions: ${updatedActions.length}`,
                    },
                    thumbnail: { url: interaction.guild.iconURL() ?? '' },
                    title: 'Current Actions in Configuration',
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },

    name: 'remove_action',
});

export const commandOptions = {
    description: 'Remove an action from the configuration',
    name: 'remove_action',
    options: [
        {
            autocomplete: true,
            description: 'Provide either the index position or name of the action to remove',
            name: 'action',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
