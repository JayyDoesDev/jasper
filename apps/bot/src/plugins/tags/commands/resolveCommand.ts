/* eslint @typescript-eslint/no-explicit-any: "off" */
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    PermissionsBitField,
} from '@antibot/interactions';
import {
    ChannelType,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    TextDisplayBuilder,
} from 'discord.js';

import { ConfigurationRoles } from '../../../container';
import { defineCommand } from '../../../define';
import { Options } from '../../../services/settingsService';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Marks post as resolved and sends a message to inform OP',
            name: 'resolve',
            options: [
                {
                    description: 'Original Question asked by OP',
                    name: 'original_question',
                    required: false,
                    type: ApplicationCommandOptionType.STRING,
                },
                {
                    description: "Summarization of the answer to the OP's original question",
                    name: 'summarized_answer',
                    required: false,
                    type: ApplicationCommandOptionType.STRING,
                },
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        deferral: {
            defer: true,
            ephemeral: false,
        },
        on: async (ctx, interaction) => {
            const originalQuestion: string = interaction.options.getString('original_question');
            const summarizedAnswer: string = interaction.options.getString('summarized_answer');

            const mentionText = new TextDisplayBuilder().setContent(
                `Post marked as resolved by <@${interaction.user.id}>`,
            );

            let container: ContainerBuilder | null = null;

            if (originalQuestion || summarizedAnswer) {
                container = new ContainerBuilder().setAccentColor(global.embedColor);

                if (originalQuestion) {
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `**Original Question:**\n${originalQuestion}`,
                        ),
                    );
                }
                if (summarizedAnswer) {
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `**Summarized Answer:**\n${summarizedAnswer}`,
                        ),
                    );
                }
            }
            const finalReply: Record<string, any> = {
                components: container ? [mentionText, container] : [mentionText],
                flags: MessageFlags.IsComponentsV2,
            };

            const appliedTags = (interaction.channel as any).appliedTags;
            if (interaction.channel.type == ChannelType.PublicThread) {
                if (appliedTags.length >= 5) {
                    return interaction.editReply({
                        content:
                            'This thread already has 5 tags applied.\nPlease remove one tag before executing `/resolve` again!',
                    });
                }

                await ctx.services.settings.configure<Options>({ guildId: interaction.guildId! });
                const { Channels } = await ctx.services.settings.getSettings();
                const allowedTagChannels = Channels.AllowedTagChannels;
                if (!allowedTagChannels.includes(interaction.channel.parentId)) {
                    return interaction.editReply({
                        content:
                            'This thread is not in a tag channel. Please move this thread to a tag channel before executing `/resolve`!',
                    });
                }

                if (!appliedTags.includes('1144008960966402149')) {
                    const tagIndex = appliedTags.indexOf('1284733312501420145');
                    if (tagIndex !== -1) {
                        appliedTags.splice(tagIndex, 1);
                    }
                    await interaction.channel.setAppliedTags([
                        '1144008960966402149',
                        ...appliedTags,
                    ]);
                }

                await interaction.editReply(finalReply);
                if (!interaction.channel.locked) {
                    await interaction.channel.setLocked(
                        true,
                        `Thread <#${interaction.channel.id}> (${interaction.channel.id}) resolved by <@${interaction.user.id}> (${interaction.user.id})`,
                    );
                }
                if (!interaction.channel.archived) {
                    await interaction.channel.setArchived(
                        true,
                        `Thread <#${interaction.channel.id}> (${interaction.channel.id}) resolved by <@${interaction.user.id}> (${interaction.user.id})`,
                    );
                }
                return;
            } else {
                return interaction.editReply({
                    content:
                        'Channel is not a thread. This command **must be** executed in Forum Posts!',
                });
            }
        },
        permissions: [PermissionsBitField.ManageThreads],
        restrictToConfigRoles: [
            ConfigurationRoles.SupportRoles,
            ConfigurationRoles.StaffRoles,
            ConfigurationRoles.AdminRoles,
            ConfigurationRoles.TagAdminRoles,
            ConfigurationRoles.TagRoles,
        ],
    }),
};
