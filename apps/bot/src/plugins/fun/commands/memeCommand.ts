import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import { AttachmentBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
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

            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const contentType = image.contentType?.toLowerCase() ?? '';
            if (!allowedTypes.includes(contentType)) {
                return interaction.reply({
                    content: 'Please upload a valid image (JPEG, PNG or WebP).',
                    flags: MessageFlags.Ephemeral,
                });
            }

            const textRegex = /^[a-zA-Z0-9\s.,!?'"@#$%&()*\-_:;\/\\]+$/;
            const top = toptext.trim();
            const bottom = bottomtext.trim();

            if (!textRegex.test(top)) {
                return interaction.reply({
                    content:
                        'Please use only alphanumeric characters and basic punctuation in the top text.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (!textRegex.test(bottom)) {
                return interaction.reply({
                    content:
                        'Please use only alphanumeric characters and basic punctuation in the bottom text.',
                    flags: MessageFlags.Ephemeral,
                });
            }

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
        restrictToConfigRoles: [
            ConfigurationRoles.AdminRoles,
            ConfigurationRoles.StaffRoles,
            ConfigurationRoles.FunCommandRoles,
        ],
    }),
};
