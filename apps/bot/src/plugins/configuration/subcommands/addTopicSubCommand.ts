import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const AddTopicSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const topic = interaction.options.getString('topic')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const topicsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Topics');

        if (topicsExistInDB.includes(topic)) {
            await interaction.reply({
                content: `For the record, **${topic}** is already in the topics list.`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await ctx.services.settings.setText<SetTextOptions>({
            guildId,
            ...{ key: 'Topics', values: topic },
        });

        await interaction.reply({
            content: `I've added **${topic}** to the topics list.`,
            flags: MessageFlags.Ephemeral,
        });
    },
    name: 'add_topic',
});

export const commandOptions = {
    description: 'Add a new topic to the list of topics.',
    name: 'add_topic',
    options: [
        {
            description: 'The topic you want to add to the list.',
            name: 'topic',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
