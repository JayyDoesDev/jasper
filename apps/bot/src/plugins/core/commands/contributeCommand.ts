import fs from 'fs';
import path from 'path';

import { ApplicationCommandOptionType, ApplicationCommandType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
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
    'CONTRIBUTING.md',
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
            description: "Want to contribute to Jasper? Here's how to get started!",
            name: 'contribute',
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
        on: async (ctx: Context, interaction) => {
            const section = interaction.options.getString('section', true);
            const choices = documentationAutocomplete(documentationContent);

            const choice = choices.find((c) => c.name === section);
            const embed = {
                color: global.embedColor,
                description: choice.value,
                title: choice.name,
            };

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        },
    }),
};
