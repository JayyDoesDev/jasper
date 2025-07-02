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
                }
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            const image = interaction.options.getAttachment('image', true);
            const position = interaction.options.getString('position') ?? 'top';

            try {
                await interaction.deferReply();
                const response = await fetch('http://localhost:8080/fun/speechbubble', {
                    body: JSON.stringify({
                        img: image.url,
                        position,
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
