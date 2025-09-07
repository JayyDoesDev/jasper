import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const RemoveActionSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('action') || '';
        const filtered = (
            await ctx.services.settings.getText<string>(interaction.guildId!, 'Actions')
        )
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },

    deferral: { defer: true, ephemeral: true },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const input = interaction.options.getString('action')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const actionsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Actions');

        const index = Number(input);
        let action = actionsExistInDB[Number(index) - 1];

        if (Number.isNaN(index)) {
            action = input;
        } else {
            if (!actionsExistInDB[index - 1] || index <= 0 || index > actionsExistInDB.length) {
                await interaction.editReply({
                    content: `I couldn't find an action at index **${index}**`,
                });
                return;
            }
        }

        await ctx.services.settings.removeText<SetTextOptions>({
            guildId,
            key: 'Actions',
            values: action,
        });

        await interaction.editReply({
            content: `I've removed **${action}** from the actions list.`,
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
