import { ApplicationCommandType, PermissionBitToString, Permissions } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import { ChatInputCommandInteraction } from 'discord.js';
import {
    subCommandOptions,
    AddChannelSubCommand,
    RemoveChannelSubCommand,
    AddRoleSubCommand,
    RemoveRoleSubCommand,
    ViewChannelSubCommand,
    AddTopicSubCommand,
    RemoveTopicSubCommand,
    ViewTopicsSubCommand,
    AddUserSubCommand,
    RemoveUserSubCommand,
    AddSkullboardChannelSubCommand,
    SetSkullboardEmojiSubCommand,
    SetSkullboardReactionThresholdSubCommand,
} from '../SubCommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'settings',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'Configure the settings',
            default_member_permissions: PermissionBitToString(
                Permissions({ ManageChannels: true }),
            ),
            options: subCommandOptions,
        },
        subCommands: {
            add_channel: AddChannelSubCommand,
            remove_channel: RemoveChannelSubCommand,
            add_role: AddRoleSubCommand,
            remove_role: RemoveRoleSubCommand,
            view: ViewChannelSubCommand,
            add_topic: AddTopicSubCommand,
            remove_topic: RemoveTopicSubCommand,
            view_topics: ViewTopicsSubCommand,
            add_user: AddUserSubCommand,
            remove_user: RemoveUserSubCommand,
            add_skullboard_channel: AddSkullboardChannelSubCommand,
            set_skullboard_emoji: SetSkullboardEmojiSubCommand,
            set_skullboard_reaction_thres: SetSkullboardReactionThresholdSubCommand,
        },
        on: async () => {},
        autocomplete: async (ctx, interaction) => {
            const subCommand = interaction.options.getSubcommand(false);
            if (!subCommand) {
                await interaction.respond([]);
                return;
            }

            const subCommandHandler = {
                add_channel: AddChannelSubCommand,
                remove_channel: RemoveChannelSubCommand,
                add_role: AddRoleSubCommand,
                remove_role: RemoveRoleSubCommand,
                view: ViewChannelSubCommand,
                view_topics: ViewTopicsSubCommand,
                add_topic: AddTopicSubCommand,
                remove_topic: RemoveTopicSubCommand,
                add_user: AddUserSubCommand,
                remove_user: RemoveUserSubCommand,
            }[subCommand];

            if (!subCommandHandler) {
                await interaction.respond([]);
                return;
            }

            await subCommandHandler.autocomplete(ctx, interaction);
        },
    }),
};
