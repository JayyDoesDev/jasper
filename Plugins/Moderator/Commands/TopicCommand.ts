import { ApplicationCommandType, PermissionsBitField } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { shuffle } from '../../../Common/array';
import { ConfigurationRoles } from '../../../Common/container';
import { defineCommand } from '../../../Common/define';
import { Options } from '../../../Services/TagService';
import { Context } from '../../../Source/Context';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Suggest a new topic!',
            name: 'topic',
            options: [],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            await ctx.services.settings.configure<Options>({ guildId: interaction.guildId });
            const { Text } = ctx.services.settings.getSettings();

            const topics = shuffle(Text.Topics);
            const content = `# ${topics[Math.floor(Math.random() * topics.length)]}`;

            const channel = ctx.channels.resolve(interaction.channelId);

            if (channel.isSendable()) {
                channel.send({ content }).catch(() => {
                    return interaction.reply({
                        content: 'Failed to send the topic!',
                        flags: MessageFlags.Ephemeral,
                    });
                });
            }

            return interaction.reply({ content: 'Topic sent!', flags: MessageFlags.Ephemeral });
        },
        permissions: [PermissionsBitField.SendMessages],
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
    }),
};
