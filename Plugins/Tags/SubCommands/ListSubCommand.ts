import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Tag } from '../../../Models/GuildSchema';
import { State } from '../../types';
import { TagResponse } from '../../../Services/TagService';

function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export const ListSubCommand = defineSubCommand({
    name: 'list',
    allowedRoles: [process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE],
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;

        const tagsResponse = await ctx.services.tags.getMultiValues<Snowflake, TagResponse[]>(
            guildId,
        );

        if (!tagsResponse || !Array.isArray(tagsResponse) || !tagsResponse.length) {
            await interaction.reply({
                content: 'No tags found.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const tags: Tag[] = tagsResponse.map((t) => ({
            TagName: t.TagName,
            TagAuthor: t.TagAuthor,
            TagEditedBy: t.TagEditedBy,
            TagResponse: {
                TagEmbedTitle: t.TagEmbedTitle,
                TagEmbedDescription: t.TagEmbedDescription,
                TagEmbedImageURL: t.TagEmbedImageURL,
                TagEmbedFooter: t.TagEmbedFooter,
            },
        }));

        const tagPages = chunkArray(tags, 10);
        const initialState: State = { page: 0, tagPages };

        ctx.pagination.set(interaction.user.id, initialState);
        const state = ctx.pagination.get(interaction.user.id);

        if (!state) {
            await interaction.reply({
                content: 'Failed to initialize pagination state',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.reply({
            embeds: [
                {
                    thumbnail: { url: interaction.guild?.iconURL() ?? undefined },
                    title: `Server Tag List`,
                    description: state.tagPages[state.page]
                        .map(
                            (e, i) =>
                                `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : 'None'}`,
                        )
                        .join('\n'),
                    footer: {
                        text: `Page: ${state.page + 1}/${state.tagPages.length} • Total Tags: ${tagsResponse.length}`,
                    },
                    color: global.embedColor,
                },
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
                            disabled: state.page === 0,
                        },
                        {
                            type: ComponentType.Button,
                            customId: `list_subcommand_button_home_${interaction.user.id}`,
                            style: ButtonStyle.Secondary,
                            label: 'Home',
                        },
                        {
                            type: ComponentType.Button,
                            customId: `list_subcommand_button_next_${interaction.user.id}`,
                            style: ButtonStyle.Primary,
                            label: 'Next',
                            disabled: state.page === state.tagPages.length - 1,
                        },
                    ],
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
});

export const commandOptions = {
    name: ListSubCommand.name,
    description: 'List all available tags',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'user',
            description: 'Filter tags by user',
            type: ApplicationCommandOptionType.USER,
            required: false,
        },
    ],
};
