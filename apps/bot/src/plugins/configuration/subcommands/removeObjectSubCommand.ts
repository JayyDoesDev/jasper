import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ButtonStyle, ChatInputCommandInteraction, ComponentType, MessageFlags } from 'discord.js';

import { chunk } from '../../../array';
import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const RemoveObjectSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('object') || '';
        const filtered = (
            await ctx.services.settings.getText<string>(interaction.guildId!, 'Objects')
        )
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const input = interaction.options.getString('object')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const objectsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Objects');

        const pages = chunk(objectsExistInDB, 10);
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
                        customId: `add_object_subcommand_button_previous_${interaction.user.id}`,
                        disabled: state.addObjectPages.page === 0,
                        label: 'Previous',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_object_subcommand_button_home_${interaction.user.id}`,
                        label: 'Home',
                        style: ButtonStyle.Secondary as const,
                        type: ComponentType.Button as const,
                    },
                    {
                        customId: `add_object_subcommand_button_next_${interaction.user.id}`,
                        disabled: state.addObjectPages.page === state.addObjectPages.pages.length - 1,
                        label: 'Next',
                        style: ButtonStyle.Primary as const,
                        type: ComponentType.Button as const,
                    },
                ],
                type: ComponentType.ActionRow as const,
            },
        ];

        const index = Number(input);
        let object = objectsExistInDB[Number(index) - 1];

        if (Number.isNaN(index)) {
            object = input;
        } else {
            if (!objectsExistInDB[index - 1] || index <= 0 || index > objectsExistInDB.length) {
                await interaction.reply({
                    content: `I couldn't find a object at index **${index}**`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        await ctx.services.settings.removeText<SetTextOptions>({
            guildId,
            key: 'Objects',
            values: object,
        });

        const updatedObjects = await ctx.services.settings.getText<string>(guildId, 'Objects');

        const updatedPages = chunk(updatedObjects, 10);
        state.addObjectPages.pages = updatedPages;
        state.addObjectPages.page = Math.min(state.addObjectPages.page, updatedPages.length - 1);

        await interaction.reply({
            components,
            content: `I've removed **${object}** from the objects list.`,
            embeds: [
                {
                    color: global.embedColor,
                    description:
                        state.addObjectPages.pages[state.addObjectPages.page]
                            .map(
                                (string, i) =>
                                    `**${state.addObjectPages.page * 10 + i + 1}.** *${string}*`,
                            )
                            .join('\n') || 'No objects',
                    footer: {
                        text: `Page: ${state.addObjectPages.page + 1}/${state.addObjectPages.pages.length} • Total Objects: ${updatedObjects.length}`,
                    },
                    thumbnail: { url: interaction.guild.iconURL() ?? '' },
                    title: 'Current Objects in Configuration',
                },
            ],
            flags: MessageFlags.Ephemeral,
        });
    },

    name: 'remove_object',
});

export const commandOptions = {
    description: 'Remove a object from the configuration',
    name: 'remove_object',
    options: [
        {
            autocomplete: true,
            description: 'Provide either the index position or name of the object to remove',
            name: 'object',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
