import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import { AttachmentBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineCommand } from '../../../define';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Add a speech bubble to an image.',
            name: 'speechbubble',
            options: [
                {
                    description: 'Image attachment',
                    name: 'image',
                    required: true,
                    type: ApplicationCommandOptionType.ATTACHMENT,
                },
                {
                    choices: [
                        {
                            name: 'Top',
                            value: 'top',
                        },
                        {
                            name: 'Bottom',
                            value: 'bottom',
                        },
                    ],
                    description: 'Position of the speech bubble (defaults to top)',
                    name: 'position',
                    required: false,
                    type: ApplicationCommandOptionType.STRING,
                },
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            const image = interaction.options.getAttachment('image', true);
            const position = interaction.options.getString('position') ?? 'top';

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const contentType = image.contentType?.toLowerCase() ?? '';
            if (!allowedTypes.includes(contentType)) {
                return interaction.reply({
                    content: 'Please upload a valid image (JPEG, PNG or WebP).',
                    flags: MessageFlags.Ephemeral,
                });
            }

            try {
                await interaction.deferReply();

                const response = await ctx.webserver.request(
                    'POST',
                    '/fun/speechbubble',
                    {
                        img: image.url,
                        position,
                    },
                    true,
                );

                const buffer = await response.arrayBuffer();
                const imageBuffer = Buffer.from(buffer);

                const attachment = new AttachmentBuilder(imageBuffer, {
                    name: 'captioned.png',
                });

                return interaction.editReply({
                    files: [attachment],
                });
            } catch (error) {
                console.error('Caption command error:', error);
                return interaction.editReply({
                    content: 'There was an error generating the caption.',
                });
            }
        },
        restrictToConfigRoles: [
            ConfigurationRoles.AdminRoles,
            ConfigurationRoles.StaffRoles,
            ConfigurationRoles.FunCommandRoles,
        ],
    }),
};
