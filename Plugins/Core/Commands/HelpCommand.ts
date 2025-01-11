import { ApplicationCommandOptionType, ApplicationCommandType } from "@antibot/interactions";
import { ChatInputCommandInteraction } from "discord.js";
import fs from 'fs';
import path from 'path';
import { documentationAutocomplete } from "../Controllers/documentationAutocomplete";
import { defineCommand } from "../../../Common/define";

const documentationPath = path.join(__dirname, '..', '..', '..', '..', 'DOCUMENTATION.md');
const documentationContent = fs.readFileSync(documentationPath, 'utf-8');

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: "help",
            type: ApplicationCommandType.CHAT_INPUT,
            description: "Displays the documentation for the bot",
            options: [
                {
                    type: ApplicationCommandOptionType.STRING,
                    name: "section",
                    description: "The section of the documentation to display",
                    required: true,
                    autocomplete: true,
                },
            ],
        },
        on: async (_, interaction) => {
            const section = interaction.options.getString("section", true);
            const choices = documentationAutocomplete(documentationContent);

            const choice = choices.find(c => c.name === section);
            const embed = {
                title: choice.name,
                description: choice.value,
                color: global.embedColor
            };

            await interaction.reply({ embeds: [embed], ephemeral: true });
        },
        autocomplete: async (_, interaction) => {
            const choices = documentationAutocomplete(documentationContent);

            // Send the choices as an autocomplete response
            await interaction.respond(
                choices.map(choice => ({
                    name: choice.name.replaceAll(/([/`*]|<_|_>)*/g, ''),
                    value: choice.name
                })).slice(0, 20)
            );
        }
    })
}
