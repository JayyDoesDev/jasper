import { ApplicationCommandType, PermissionsBitField } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { shuffle } from '../../../array';
import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineCommand } from '../../../define';
import { Options } from '../../../services/tagService';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Suggest a new topic!',
            name: 'topic',
            options: [],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        deferral: {
            defer: true,
            ephemeral: true,
        },
        on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            await ctx.services.settings.configure<Options>({ guildId: interaction.guildId });
            const { Text } = ctx.services.settings.getSettings();

            const topics = shuffle(Text.Topics);
            const content = `# ${topics[Math.floor(Math.random() * topics.length)]}`;

            const channel = ctx.channels.resolve(interaction.channelId);

            if (channel.isSendable()) {
                channel.send({ content }).catch(() => {
                    return interaction.editReply({
                        content: 'Failed to send the topic!',
                    });
                });
            }

            return interaction.editReply({ content: 'Topic sent!' });
        },
        permissions: [PermissionsBitField.SendMessages],
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
    }),
};
