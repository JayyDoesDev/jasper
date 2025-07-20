import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineSubCommand } from '../../../define';
import { Options, SetTextOptions } from '../../../services/settingsService';

export const RemoveTopicSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const query = interaction.options.getString('topic') || '';
        const filtered = (
            await ctx.services.settings.getText<string>(interaction.guildId!, 'Topics')
        )
            .filter((key: string) => key.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((key) => ({ name: key as string, value: key as string }));

        await interaction.respond(filtered);
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const input = interaction.options.getString('topic')!;

        await ctx.services.settings.configure<Options>({ guildId });
        const topicsExistInDB = await ctx.services.settings.getText<string>(guildId, 'Topics');

        const index = Number(input);
        let topic = topicsExistInDB[Number(index) - 1];

        if (Number.isNaN(index)) {
            topic = input;
        } else {
            if (!topicsExistInDB[index - 1] || index <= 0 || index > topicsExistInDB.length) {
                await interaction.reply({
                    content: `I couldn't find a topic at index **${index}**`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        await ctx.services.settings.removeText<SetTextOptions>({
            guildId,
            key: 'Topics',
            values: topic,
        });

        await interaction.reply({
            content: `I've removed **${topic}** from the topics list.`,
            flags: MessageFlags.Ephemeral,
        });
    },

    name: 'remove_topic',
});

export const commandOptions = {
    description: 'Remove a topic from the configuration',
    name: 'remove_topic',
    options: [
        {
            autocomplete: true,
            description: 'Provide either the index position or name of the topic to remove',
            name: 'topic',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
