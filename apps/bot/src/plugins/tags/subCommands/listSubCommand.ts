import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { ConfigurationChannels, ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';
import { Tag } from '../../../models/guildSchema';
import { TagResponse } from '../../../services/tagService';
import { State } from '../../types';

export const ListSubCommand = defineSubCommand({
    deferral: {
        defer: true,
        ephemeral: true,
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;

        const tagsResponse = await ctx.services.tags.getMultiValues<Snowflake, TagResponse[]>(
            guildId,
        );

        if (!tagsResponse || !Array.isArray(tagsResponse) || !tagsResponse.length) {
            await interaction.editReply({
                content: 'No tags found.',
            });
            return;
        }

        const tags: Tag[] = tagsResponse.map((t) => ({
            TagAuthor: t.TagAuthor,
            TagEditedBy: t.TagEditedBy,
            TagName: t.TagName,
            TagResponse: {
                TagEmbedDescription: t.TagEmbedDescription,
                TagEmbedFooter: t.TagEmbedFooter,
                TagEmbedImageURL: t.TagEmbedImageURL,
                TagEmbedTitle: t.TagEmbedTitle,
            },
        }));

        const tagPages = chunk(tags, 10);
        const initialState: State = { page: 0, tagPages };

        ctx.pagination.set(interaction.user.id, initialState);
        const state = ctx.pagination.get(interaction.user.id);

        if (!state) {
            await interaction.editReply({
                content: 'Failed to initialize pagination state',
            });
            return;
        }

        await interaction.editReply({
            components: [
                {
                    components: [
                        {
                            customId: `list_subcommand_button_previous_${interaction.user.id}`,
                            disabled: state.page === 0,
                            label: 'Previous',
                            style: ButtonStyle.Primary,
                            type: ComponentType.Button,
                        },
                        {
                            customId: `list_subcommand_button_home_${interaction.user.id}`,
                            label: 'Home',
                            style: ButtonStyle.Secondary,
                            type: ComponentType.Button,
                        },
                        {
                            customId: `list_subcommand_button_next_${interaction.user.id}`,
                            disabled: state.page === state.tagPages.length - 1,
                            label: 'Next',
                            style: ButtonStyle.Primary,
                            type: ComponentType.Button,
                        },
                    ],
                    type: ComponentType.ActionRow,
                },
            ],
            embeds: [
                {
                    color: global.embedColor,
                    description: state.tagPages[state.page]
                        .map(
                            (e, i) =>
                                `> **${state.page * 10 + i + 1}.** \`${e.TagName}\` **•** ${
                                    e.TagAuthor ? `<@${e.TagAuthor}>` : 'None'
                                }`,
                        )
                        .join('\n'),
                    footer: {
                        text: `Page: ${state.page + 1}/${state.tagPages.length} • Total Tags: ${tagsResponse.length}`,
                    },
                    thumbnail: { url: interaction.guild?.iconURL() ?? undefined },
                    title: `Server Tag List`,
                },
            ],
        });
    },
    name: 'list',
    restrictToConfigChannels: [ConfigurationChannels.AllowedTagChannels],
    restrictToConfigRoles: [
        ConfigurationRoles.SupportRoles,
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
        ConfigurationRoles.TagRoles,
    ],
});

export const commandOptions = {
    description: 'List all available tags',
    name: ListSubCommand.name,
    options: [
        {
            description: 'Filter tags by user',
            name: 'user',
            required: false,
            type: ApplicationCommandOptionType.USER,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
