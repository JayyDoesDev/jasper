import { ApplicationCommandType, PermissionsBitField } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ConfigurationRoles } from '../../../Common/container';
import { Context } from '../../../Source/Context';
import { Options } from '../../../Services/TagService';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'topic',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'Suggest a new topic!',
            options: [],
        },
        restrictToConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
        permissions: [PermissionsBitField.SendMessages],
        on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            await ctx.services.settings.configure<Options>({ guildId: interaction.guildId });
            const { Text } = ctx.services.settings.getSettings();
            const shuffle = (array: string[]) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            const topics = shuffle(Text.Topics);
            const content = `# ${topics[Math.floor(Math.random() * topics.length)]}`;

            const channel = ctx.channels.resolve(interaction.channelId);

            if (channel.isSendable()) {
                channel.send({ content });
            }

            return interaction.reply({ content: 'Topic sent!', flags: MessageFlags.Ephemeral });
        },
    }),
};
