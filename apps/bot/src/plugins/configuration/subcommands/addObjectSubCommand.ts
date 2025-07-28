import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const AddObjectSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const object = interaction.options.getString('object')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const objectExistInDB = await ctx.services.settings.getText<string>(guildId, 'Objects');

        if (objectExistInDB.includes(object)) {
            await interaction.reply({
                content: `For the record, **${object}** is already in the objects list.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setText<SetTextOptions>({
            guildId,
            ...{ key: 'Objects', values: object },
        });

        await interaction.reply({
            content: `I've added **${object}** to the objects list.`,
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
