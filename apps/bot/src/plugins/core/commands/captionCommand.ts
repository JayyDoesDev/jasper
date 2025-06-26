import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
} from '@antibot/interactions';
import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
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
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            const text = interaction.options.getString('text', true);
            const image = interaction.options.getAttachment('image', true);

            try {
                const response = await fetch('http://localhost:8080/fun/meme', {
                    body: JSON.stringify({
                        bottomText: '',
                        fontSize: 48,
                        image: image.url,
                        memeStyle: 'classic',
                        strokeColor: '#000000',
                        textColor: '#ffffff',
                        topText: text,
                }),
                    headers: {
                        'Content-Type': 'application/json',
                        'JASPER-API-KEY': ctx.env.get('jasper_api_key'),
                    },
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error(`Render server error: ${response.status}`);
                }

                const buffer = await response.arrayBuffer();
                const imageBuffer = Buffer.from(buffer);

                const attachment = new AttachmentBuilder(imageBuffer, {
                    name: 'captioned.png',
                });

                return interaction.reply({
                    files: [attachment],
                });
            } catch (error) {
                console.error('Caption command error:', error);
                return interaction.reply({
                    content: 'There was an error generating the caption.',
                    flags: MessageFlags.Ephemeral,
                });
            }
        },
    }),
};
