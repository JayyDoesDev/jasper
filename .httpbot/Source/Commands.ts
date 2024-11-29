import { ApplicationCommandType } from "@antibot/interactions";
import { InteractionResponseType } from "discord-interactions";
import { Command } from "../Types/Command";
import { respond } from "../Lib/Respond";

const VoteCommand: Command = {
    command: {
        type: ApplicationCommandType.CHAT_INPUT,
        name: "vote",
        description: "test",
        options: []
    },
    on: (interaction) => {
        respond({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: {content: "test" } });
    },
}

export const commands = [VoteCommand];

const commandMap: Record<string, Command> = {};
for (const command of commands) {
    commandMap[command.command.name] = command;
}

export function handleCommands(interaction: any) {
    const command = commandMap[interaction.data.name];
    if (command) {
        command.on(interaction);
    }
}