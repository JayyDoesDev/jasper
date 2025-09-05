import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineCommand } from '../../../define';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Add a caption to an image.',
            name: 'caption',
            options: [
                {
                    description: 'Caption text',
                    name: 'text',
                    required: true,
                    type: ApplicationCommandOptionType.STRING,
                },
                {
                    description: 'Image attachment',
                    name: 'image',
                    required: true,
                    type: ApplicationCommandOptionType.ATTACHMENT,
                },
                {
                    description: 'Font size for the caption',
                    name: 'font_size',
                    required: false,
                    type: ApplicationCommandOptionType.INTEGER,
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
                    description: 'Position of the caption (top or bottom)',
                    name: 'position',
                    required: false,
                    type: ApplicationCommandOptionType.STRING,
                },
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        deferral: { defer: true, ephemeral: false },
        on: async (ctx: Context, interaction) => {
            const text = interaction.options.getString('text', true);
            const image = interaction.options.getAttachment('image', true);
            const fontSize = interaction.options.getInteger('font_size') ?? 72;
            const position = interaction.options.getString('position') ?? 'top';

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const contentType = image.contentType?.toLowerCase() ?? '';
            if (!allowedTypes.includes(contentType)) {
                return interaction.editReply({
                    content: 'Please upload a valid image (JPEG, PNG or WebP).',
                });
            }

            const textRegex = /^[a-zA-Z0-9\s.,!?'"@#$%&()*\-_:;\/\\]+$/;
            if (!textRegex.test(text.trim())) {
                return interaction.editReply({
                    content:
                        'Please use only alphanumeric characters and basic punctuation in the top text.',
                });
            }

            try {
                const response = await ctx.webserver.request(
                    'POST',
                    '/fun/caption',
                    {
                        fontSize,
                        img: image.url,
                        position,
                        text,
                    },
                    true,
                );

                if (!response.ok) {
                    const message =
                        (await response.text().catch(() => '')) ||
                        'There was an error generating the caption.';
                    return interaction.editReply({
                        content: message,
                    });
                }

                const buffer = await response.arrayBuffer();
                const imageBuffer = Buffer.from(buffer);

                const attachment = new AttachmentBuilder(imageBuffer, {
                    name: 'captioned.png',
                });

                return interaction.editReply({
                    files: [attachment],
                });
            } catch (error) {
                console.error('[caption] request failed:', error);
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
