import fs from 'fs';
import path from 'path';

import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageActionRowComponentBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';

import { defineCommand } from '../../../define';
import { documentationAutocomplete } from '../controllers/documentationAutocomplete';

const documentationPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    '..',
    'DOCUMENTATION.md',
);
const documentationContent = fs.readFileSync(documentationPath, 'utf-8');

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        autocomplete: async (_, interaction) => {
            const choices = documentationAutocomplete(documentationContent);

            // Send the choices as an autocomplete response
            await interaction.respond(
                choices
                    .map((choice) => ({
                        name: choice.name.replaceAll(/([/`*]|<_|_>)*/g, ''),
                        value: choice.name,
                    }))
                    .slice(0, 20),
            );
        },
        command: {
            description: 'Displays the documentation for the bot',
            name: 'help',
            options: [
                {
                    autocomplete: true,
                    description: 'The section of the documentation to display',
                    name: 'section',
                    required: true,
                    type: ApplicationCommandOptionType.STRING,
                },
            ],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (_, interaction) => {
            const section = interaction.options.getString('section', true);
            const choices = documentationAutocomplete(documentationContent);

            const choice = choices.find((c) => c.name === section);
            const helpComponents = [
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`## ${choice.name}`),
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true),
                    )
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(choice.value))
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true),
                    )
                    .addActionRowComponents(
                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel('View Full Documentation')
                                .setURL(
                                    'https://github.com/JayyDoesDev/jasper/blob/main/DOCUMENTATION.md',
                                ),
                        ),
                    ),
            ];

            await interaction.reply({
                components: helpComponents,
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });
        },
    }),
};
