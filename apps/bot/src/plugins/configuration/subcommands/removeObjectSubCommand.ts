import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

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

        await interaction.reply({
            content: `I've removed **${object}** from the objects list.`,
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
