import { ApplicationCommandOptionType } from '@antibot/interactions';
import {
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options } from '../../../services/settingsService';

export const ViewActionSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
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

        let components = [];

        if (actionsExistInDB.length !== 0) {
            components = [
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
        }

        const viewActionsComponents = [
            new ContainerBuilder()
                .setAccentColor(global.embedColor)
                .addSectionComponents(
                    new SectionBuilder()
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(interaction.guild?.iconURL()),
                        )
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                '## Current Actions in Configuration',
                            ),
                        ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        (state.addActionPages.pages[state.addActionPages.page] || [])
                            .map(
                                (string, i) =>
                                    `**${state.addActionPages.page * 10 + i + 1}.** *${string}*`,
                            )
                            .join('\n') || 'There are no actions configured.',
                    ),
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `-# Page: ${state.addActionPages.page + 1}/${state.addActionPages.pages.length} • Total Actions: ${actionsExistInDB.length}`,
                    ),
                ),
        ];

        await interaction.reply({
            components:
                components.length > 0
                    ? [...viewActionsComponents, ...components]
                    : viewActionsComponents,
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
    },
    name: 'view_actions',
});

export const commandOptions = {
    description: 'View the current actions in the configuration',
    name: 'view_actions',
    options: [],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
