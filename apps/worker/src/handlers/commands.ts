import {
    APIChatInputApplicationCommandInteraction,
    APIInteraction,
    ApplicationCommandType,
    InteractionType,
} from 'discord-api-types/v10';

import { commands } from '../commands/registry';
import { Env } from '../types/server';
import { createMessageResponse } from '../utils/responses';

const isChatInputCommand = (interaction: APIInteraction): interaction is APIChatInputApplicationCommandInteraction => {
    return (
        interaction.type === InteractionType.ApplicationCommand &&
        'data' in interaction &&
        interaction.data.type === ApplicationCommandType.ChatInput
    );
};

export const handleCommands = (env: Env, interaction: APIChatInputApplicationCommandInteraction) => {
    const commandName = interaction.data.name.toLowerCase();
    const command = commands.find(cmd => cmd.name.toLowerCase() === commandName);

    if (!command || !command.handler) {
        return createMessageResponse('Unknown command', true);
    }

    return command.handler(env, interaction);
};

export const handleCommand = async (env: Env, interaction: APIInteraction): Promise<Response> => {
    if (!isChatInputCommand(interaction)) {
        return createMessageResponse('Invalid interaction type', true);
    }

    return handleCommands(env, interaction);
};
