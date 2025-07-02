import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';

import { Context } from '../../../classes/context';
import { defineCommand } from '../../../define';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            description: 'Add text (top or bottom) to an image.',
            name: 'meme',
            options: [
                {
                    description: 'Top text',
                    name: 'toptext',
                    required: true,
                    type: ApplicationCommandOptionType.STRING,
                },
                {
                    description: 'Bottom text',
                    name: 'bottomtext',
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
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            const toptext = interaction.options.getString('toptext', true) ?? '';
            const bottomtext = interaction.options.getString('bottomtext', true) ?? '';
            const image = interaction.options.getAttachment('image', true);
            const fontSize = interaction.options.getInteger('font_size') ?? 72;

            try {
                await interaction.deferReply();
                const response = await ctx.webserver.request(
                    'POST',
                    '/fun/meme',
                    {
                        bottomtext,
                        fontSize,
                        img: image.url,
                        toptext,
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
    }),
};
