import { ApplicationCommandOptionType, ApplicationCommandType } from "@antibot/interactions";
import { DefineCommand } from "../../../Common/DefineCommand";
import { ChatInputCommandInteraction } from "discord.js";
import fs from 'fs';
import path from 'path';
import { Nullable } from "../../../Common/Nullable";

type DocumentationItem = {
    name: string;
    value: string;
};

/**
 * Autocomplete topics and subtopics from the documentation content.
 * @param content The documentation content.
 * @returns An array of objects with "name" and "value" fields.
 */
function autocomplete(content: string): DocumentationItem[] {
    const lines = content.split('\n');
    const result: DocumentationItem[] = [];
    let currentTopic: Nullable<string> = null;
    let currentSubtopic: Nullable<string> = null;
    let currentContent: string[] = [];

    const addCurrentItem = () => {
        if (currentSubtopic && currentContent.length > 0) {
            result.push({
                name: `${ currentTopic } > ${ currentSubtopic }`,
                value: currentContent.join('\n').trim()
            });
        } else if (currentTopic && !currentSubtopic && currentContent.length > 0) {
            result.push({
                name: currentTopic,
                value: currentContent.join('\n').trim()
            });
        }
    };

    for (const line of lines) {
        if (line.startsWith('## ')) {
            addCurrentItem();
            currentTopic = line.substring(3).trim();
            currentSubtopic = null;
            currentContent = [];
        } else if (line.startsWith('### ')) {
            addCurrentItem();
            currentSubtopic = line.substring(4).trim();
            currentContent = [];
        } else if (line.trim().length > 0) {
            currentContent.push(line);
        }
    }
    addCurrentItem();
    return result;
}

export const HelpCommand = DefineCommand<ChatInputCommandInteraction>({
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
        const documentationPath = path.join(__dirname, '..', '..', '..', '..', 'DOCUMENTATION.md');
        const documentationContent = fs.readFileSync(documentationPath, 'utf-8');

        const section = interaction.options.getString("section", true);
        const choices = autocomplete(documentationContent);

        const choice = choices.find(c => c.name === section);

        const embed = {
            title: choice.name.replace('Commands > ', ''),
            description: choice.value,
            color: 0xff9a00
        };

        await interaction.reply({ embeds: [ embed ], ephemeral: true });
    },
    autocomplete: async (_, interaction) => {
        const documentationPath = path.join(__dirname, '..', '..', '..', '..', 'DOCUMENTATION.md');
        const documentationContent = fs.readFileSync(documentationPath, 'utf-8');

        const choices = autocomplete(documentationContent);

        // Send the choices as an autocomplete response
        await interaction.respond(
            choices.map(choice => ({
                name: choice.name.replaceAll(/([/`*]|<_|_>)*/g, ''),
                value: choice.name
            })).slice(0, 20)
        );
    }
});
