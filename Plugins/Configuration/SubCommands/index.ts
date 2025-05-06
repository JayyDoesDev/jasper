import { commandOptions as addChannelOptions, AddChannelSubCommand } from './AddChannelSubCommand';
import { commandOptions as addRoleOptions, AddRoleSubCommand } from './AddRoleSubCommand';
import {
    commandOptions as addSkullboardChannelOptions,
    AddSkullboardChannelSubCommand,
} from './AddSkullboardChannelSubCommand';
import { commandOptions as addTopicOptions, AddTopicSubCommand } from './AddTopicSubCommand';
import { commandOptions as addUserOptions, AddUserSubCommand } from './AddUserSubCommand';
import {
    commandOptions as removeChannelOptions,
    RemoveChannelSubCommand,
} from './RemoveChannelSubCommand';
import { commandOptions as removeRoleOptions, RemoveRoleSubCommand } from './RemoveRoleSubCommand';
import {
    commandOptions as removeTopicOptions,
    RemoveTopicSubCommand,
} from './RemoveTopicSubCommand';
import { commandOptions as removeUserOptions, RemoveUserSubCommand } from './RemoveUserSubCommand';
import {
    commandOptions as setSkullboardEmojiOptions,
    SetSkullboardEmojiSubCommand,
} from './SetSkullboardEmoji';
import {
    commandOptions as setSkullboardReactionThresholdOptions,
    SetSkullboardReactionThresholdSubCommand,
} from './SetSkullboardReactionThreshold';
import { ViewChannelSubCommand, commandOptions as viewOptions } from './ViewSubCommand';
import { commandOptions as viewTopicsOptions, ViewTopicsSubCommand } from './ViewTopicsSubCommand';

export const subCommandOptions = [
    addChannelOptions,
    removeChannelOptions,
    addRoleOptions,
    removeRoleOptions,
    viewOptions,
    addTopicOptions,
    removeTopicOptions,
    viewTopicsOptions,
    addUserOptions,
    removeUserOptions,
    addSkullboardChannelOptions,
    setSkullboardEmojiOptions,
    setSkullboardReactionThresholdOptions,
];

export {
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
    ViewChannelSubCommand,
    ViewTopicsSubCommand,
};
