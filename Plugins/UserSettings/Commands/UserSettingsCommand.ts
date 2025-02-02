import { ApplicationCommandOptions, ApplicationCommandType } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import { ChatInputCommandInteraction } from 'discord.js';

const subCommands: ApplicationCommandOptions[] = [];

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'user_settings',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'Change your user settings to fit your preferences.',
            options: subCommands,
        },
        on: () => {},
    }),
};
