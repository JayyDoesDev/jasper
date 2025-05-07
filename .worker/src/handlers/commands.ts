import { 
    APIChatInputApplicationCommandInteraction, 
    APIInteraction,
    ApplicationCommandType,
    InteractionType
} from 'discord-api-types/v10';

import { AWW_COMMAND, INVITE_COMMAND } from '../commands/definitions';
import { CommandName } from '../commands/registry';
import { Env } from '../types/server';
import { createMessageResponse } from '../utils/responses';

const isChatInputCommand = (
    interaction: APIInteraction
): interaction is APIChatInputApplicationCommandInteraction => {
    return (
        interaction.type === InteractionType.ApplicationCommand &&
        'data' in interaction &&
        interaction.data.type === ApplicationCommandType.ChatInput
    );
};

export const handleAwwCommand = async () => {
    return createMessageResponse('awwww');
};

export const handleInviteCommand = async (env: Env) => {
    const applicationId = env.BOT_ID;
    const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
    return createMessageResponse(INVITE_URL, true);
};

type CommandHandler = (env: Env, interaction: APIChatInputApplicationCommandInteraction) => Promise<Response>;

const commandHandlers: Record<CommandName, CommandHandler> = {
    [AWW_COMMAND.name]: handleAwwCommand,
    [INVITE_COMMAND.name]: handleInviteCommand,
} as const;

export const handleCommand = async (
    env: Env,
    interaction: APIInteraction
): Promise<Response> => {
    if (!isChatInputCommand(interaction)) {
        return createMessageResponse('Invalid interaction type', true);
    }

    const commandName = interaction.data.name.toLowerCase();
    const handler = commandHandlers[commandName as CommandName];
    
    if (!handler) {
        return createMessageResponse('Unknown command', true);
    }

    return handler(env, interaction);
};
