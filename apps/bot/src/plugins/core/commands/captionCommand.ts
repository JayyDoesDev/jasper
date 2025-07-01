import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
} from '@antibot/interactions';
import {
    AttachmentBuilder,
    ChatInputCommandInteraction
} from 'discord.js';

import { Context } from '../../../classes/context';
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
                }
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            const text = interaction.options.getString('text', true);
            const image = interaction.options.getAttachment('image', true);
            const fontSize = interaction.options.getInteger('font_size') ?? 72;
            const position = interaction.options.getString('position') ?? 'top';

            try {
                await interaction.deferReply();
                const response = await fetch('http://localhost:8080/fun/meme', {
                    body: JSON.stringify({
                        fontSize,
                        img: image.url,
                        position,
                        text
                }),
                    headers: {
                        'Content-Type': 'application/json',
                        'JASPER-API-KEY': ctx.env.get('jasper_api_key'),
                    },
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error(`Render server error: ${response.status} ${await response.text()}`);
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
                console.error('Caption command error:', error);
                return interaction.editReply({
                    content: 'There was an error generating the caption.'
                });
            }
        },
    }),
};
