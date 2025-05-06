import {
    ApplicationCommandType,
    PermissionBitToString,
    Permissions,
    PermissionsBitField,
} from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { defineCommand } from '../../../Common/define';
import { Context } from '../../../Source/Context';
import { NotifyVideoDiscussionsSubCommand, subCommandOptions } from '../SubCommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            default_member_permissions: PermissionBitToString(Permissions({ Administrator: true })),
            description: 'Force Jasper to do something.',
            name: 'bruteforce',
            options: subCommandOptions,
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async (ctx: Context, interaction) => {
            await interaction.reply({
                content: 'This command or subcommand is not properly configured.',
                flags: MessageFlags.Ephemeral,
            });
        },
        permissions: [PermissionsBitField.SendMessages],
        subCommands: {
            notify_video_discussions: NotifyVideoDiscussionsSubCommand,
        },
    }),
};
