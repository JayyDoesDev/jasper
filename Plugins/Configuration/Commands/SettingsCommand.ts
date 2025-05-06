import { ApplicationCommandType, PermissionBitToString, Permissions } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { defineCommand } from '../../../Common/define';
import {
    AddChannelSubCommand,
    AddRoleSubCommand,
    AddSkullboardChannelSubCommand,
    AddTopicSubCommand,
    AddUserSubCommand,
    RemoveChannelSubCommand,
    RemoveRoleSubCommand,
    RemoveTopicSubCommand,
    RemoveUserSubCommand,
    SetSkullboardEmojiSubCommand,
    SetSkullboardReactionThresholdSubCommand,
    subCommandOptions,
    ViewChannelSubCommand,
    ViewTopicsSubCommand,
} from '../SubCommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        autocomplete: async (ctx, interaction) => {
            const subCommand = interaction.options.getSubcommand(false);
            if (!subCommand) {
                await interaction.respond([]);
                return;
            }

            const subCommandHandler = {
                add_channel: AddChannelSubCommand,
                add_role: AddRoleSubCommand,
                add_topic: AddTopicSubCommand,
                add_user: AddUserSubCommand,
                remove_channel: RemoveChannelSubCommand,
                remove_role: RemoveRoleSubCommand,
                remove_topic: RemoveTopicSubCommand,
                remove_user: RemoveUserSubCommand,
                view: ViewChannelSubCommand,
                view_topics: ViewTopicsSubCommand,
            }[subCommand];

            if (!subCommandHandler) {
                await interaction.respond([]);
                return;
            }

            await subCommandHandler.autocomplete(ctx, interaction);
        },
        command: {
            default_member_permissions: PermissionBitToString(
                Permissions({ ManageChannels: true }),
            ),
            description: 'Configure the settings',
            name: 'settings',
            options: subCommandOptions,
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async () => {},
        subCommands: {
            add_channel: AddChannelSubCommand,
            add_role: AddRoleSubCommand,
            add_skullboard_channel: AddSkullboardChannelSubCommand,
            add_topic: AddTopicSubCommand,
            add_user: AddUserSubCommand,
            remove_channel: RemoveChannelSubCommand,
            remove_role: RemoveRoleSubCommand,
            remove_topic: RemoveTopicSubCommand,
            remove_user: RemoveUserSubCommand,
            set_skullboard_emoji: SetSkullboardEmojiSubCommand,
            set_skullboard_reaction_thres: SetSkullboardReactionThresholdSubCommand,
            view: ViewChannelSubCommand,
            view_topics: ViewTopicsSubCommand,
        },
    }),
};
