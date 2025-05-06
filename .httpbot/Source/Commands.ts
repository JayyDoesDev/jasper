import { ApplicationCommandType } from '@antibot/interactions';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-interactions';

import { respond } from '../Lib/Respond';
import { Command } from '../Types/Command';

const VoteCommand: Command = {
  command: {
    description: 'test',
    name: 'vote',
    options: [],
    type: ApplicationCommandType.CHAT_INPUT,
  },
  on: () => {
    respond({ data: { content: 'test' }, type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE });
  },
};

export const commands = [VoteCommand];

const commandMap: Record<string, Command> = {};
for (const command of commands) {
  commandMap[command.command.name] = command;
}

export function handleCommands(interaction: APIChatInputApplicationCommandInteraction) {
  const command = commandMap[interaction.data.name];
  if (command) {
    command.on(interaction);
  }
}
