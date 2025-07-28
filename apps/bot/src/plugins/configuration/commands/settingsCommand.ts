import { ApplicationCommandType, PermissionBitToString, Permissions } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { defineCommand } from '../../../define';
import {
    AddActionSubCommand,
    AddChannelSubCommand,
    AddObjectSubCommand,
    AddRoleSubCommand,
    AddSkullboardChannelSubCommand,
    AddTopicSubCommand,
    AddUserSubCommand,
    RemoveActionSubCommand,
    RemoveChannelSubCommand,
    RemoveObjectSubCommand,
    RemoveRoleSubCommand,
    RemoveTopicSubCommand,
    RemoveUserSubCommand,
    SetSkullboardEmojiSubCommand,
    SetSkullboardReactionThresholdSubCommand,
    SetWarningCheckSubCommand,
    subCommandOptions,
    ViewActionSubCommand,
    ViewChannelSubCommand,
    ViewTopicsSubCommand,
} from '../subcommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        autocomplete: async (ctx, interaction) => {
            const subCommand = interaction.options.getSubcommand(false);
            if (!subCommand) {
                await interaction.respond([]);
                return;
            }

            const subCommandHandler = {
                add_action: AddActionSubCommand,
                add_channel: AddChannelSubCommand,
                add_object: AddObjectSubCommand,
                add_role: AddRoleSubCommand,
                add_topic: AddTopicSubCommand,
                add_user: AddUserSubCommand,
                remove_action: RemoveActionSubCommand,
                remove_channel: RemoveChannelSubCommand,
                remove_object: RemoveObjectSubCommand,
                remove_role: RemoveRoleSubCommand,
                remove_topic: RemoveTopicSubCommand,
                remove_user: RemoveUserSubCommand,
                view: ViewChannelSubCommand,
                view_actions: ViewActionSubCommand,
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
            add_action: AddActionSubCommand,
            add_channel: AddChannelSubCommand,
            add_object: AddObjectSubCommand,
            add_role: AddRoleSubCommand,
            add_skullboard_channel: AddSkullboardChannelSubCommand,
            add_topic: AddTopicSubCommand,
            add_user: AddUserSubCommand,
            remove_action: RemoveActionSubCommand,
            remove_channel: RemoveChannelSubCommand,
            remove_object: RemoveObjectSubCommand,
            remove_role: RemoveRoleSubCommand,
            remove_topic: RemoveTopicSubCommand,
            remove_user: RemoveUserSubCommand,
            set_skullboard_emoji: SetSkullboardEmojiSubCommand,
            set_skullboard_reaction_thres: SetSkullboardReactionThresholdSubCommand,
            set_warning_check: SetWarningCheckSubCommand,
            view: ViewChannelSubCommand,
            view_actions: ViewActionSubCommand,
            view_topics: ViewTopicsSubCommand,
        },
    }),
};
