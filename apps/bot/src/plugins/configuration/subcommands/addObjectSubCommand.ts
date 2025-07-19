import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetObjectOptions } from '../../../services/settingsService';

export const AddObjectSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const object = interaction.options.getString('object')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const objectExistInDB = await ctx.services.settings.getActions<string>(guildId, 'Objects');

        const pages = chunk(objectExistInDB, 10);
        const initialState = { addObjectPages: { page: 0, pages } };

        ctx.pagination.set(interaction.user.id, initialState);
        const state = ctx.pagination.get(interaction.user.id);

        if (!state || !state.addObjectPages) {
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
                        customId: `add_object_subcommandbutton_previous_${interaction.user.id}`,
                        disabled: state.addObjectPages.page === 0,
                        label: 'Previous',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_object_subcommandbutton_home_${interaction.user.id}`,
                        label: 'Home',
                        style: ButtonStyle.Secondary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_object_subcommandbutton_next_${interaction.user.id}`,
                        disabled: state.addObjectPages.page === state.addObjectPages.pages.length - 1,
                        label: 'Next',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                ],
                type: ComponentType.ActionRow as const,
            },
        ];

        if (objectExistInDB.includes(object)) {
            await interaction.reply({
                components,
                content: `For the record, **${object}** is already in the objects list.`,
                embeds: [
                    {
                        color: global.embedColor,
                        description:
                            state.addObjectPages.pages[state.addObjectPages.page]
                                .map(
                                    (string, i) =>
                                        `**${state.addObjectPages.page * 10 + i + 1}.** *${string}*`,
                                )
                                .join('\n') || 'No Objects',
                        footer: {
                            text: `Page: ${state.addObjectPages.page + 1}/${state.addObjectPages.pages.length} • Total objects: ${objectExistInDB.length}`,
                        },
                        thumbnail: { url: interaction.guild.iconURL() ?? '' },
                        title: 'Current Objects in Configuration',
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setObjects<SetObjectOptions>({
            guildId,
            ...{ key: 'Objects', objects: object},
        });

        const updatedObjects = await ctx.services.settings.getActions<string>(guildId, 'Objects');
        const updatedPages = chunk(updatedObjects, 10);
        state.addObjectPages.pages = updatedPages;

        await interaction.reply({
            components,
            content: `I've added **${object}** to the objects list.`,
            embeds: [
                {
                    color: global.embedColor,
                    description:
                        state.addObjectPages.pages[state.addObjectPages.page]
                            .map(
                                (string, i) =>
                                    `**${state.addObjectPages.page * 10 + i + 1}.** *${string}*`,
                            )
                            .join('\n') || 'No actions',
                    footer: {
                        text: `Page: ${state.addObjectPages.page + 1}/${state.addObjectPages.pages.length} • Total objects: ${updatedObjects.length}`,
                    },
                    thumbnail: { url: interaction.guild.iconURL() ?? '' },
                    title: 'Current Objects in Configuration',
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'add_action',
});

export const commandOptions = {
    description: 'Add a new object to the list for the act command. (preceeded by "a" or "an ")',
    name: 'add_object',
    options: [
        {
            description: 'The object you want to add to the list.',
            name: 'object',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
