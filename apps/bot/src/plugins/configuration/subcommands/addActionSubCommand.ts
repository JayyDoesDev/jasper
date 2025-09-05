import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const AddActionSubCommand = defineSubCommand({
    deferral: { defer: true, ephemeral: true },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const action = interaction.options.getString('action')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const actionsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Actions');

        if (actionsExistInDB.includes(action)) {
            await interaction.editReply({
                content: `For the record, **${action}** is already in the actions list.`,
            });
            return;
        }

        await ctx.services.settings.setText<SetTextOptions>({
            guildId,
            ...{ key: 'Actions', values: action },
        });

        await interaction.editReply({
            content: `I've added **${action}** to the actions list.`,
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
