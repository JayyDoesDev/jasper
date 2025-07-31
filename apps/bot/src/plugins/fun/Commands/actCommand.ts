import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { shuffle } from '../../../array';
import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineCommand } from '../../../define';
import { Options } from '../../../services/tagService';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Perform a random action on a user.',
            name: 'act',
            options: [
                {
                    description: 'target',
                    name: 'user',
                    required: true,
                    type: ApplicationCommandOptionType.USER,
                },
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            const user = interaction.options.getUser('user') ?? 'top';

            await ctx.services.settings.configure<Options>({ guildId: interaction.guildId });
            const { Text } = ctx.services.settings.getSettings();

            const actions = shuffle(Text.Actions);
            const objects = shuffle(Text.Objects);
            if (user && typeof user === 'object' && 'id' in user) {
                const author = interaction.member.user.id;
                const action = actions[Math.floor(Math.random() * actions.length)];
                const object = objects[Math.floor(Math.random() * objects.length)];

                await interaction.reply({
                    allowedMentions: { users: [] },
                    content: `<@!${author}> ${action} <@!${user.id}> with ${object}`,
                });
            } else {
                await interaction.reply(`Couldn't find that user.`);
            }
        },
        restrictToConfigRoles: [
            ConfigurationRoles.AdminRoles,
            ConfigurationRoles.StaffRoles,
            ConfigurationRoles.FunCommandRoles,
        ],
    }),
};
