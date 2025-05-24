import { commandOptions as addChannelOptions, AddChannelSubCommand } from './addChannelSubCommand';
import { commandOptions as addRoleOptions, AddRoleSubCommand } from './addRoleSubCommand';
import {
    commandOptions as addSkullboardChannelOptions,
    AddSkullboardChannelSubCommand,
} from './addSkullboardChannelSubCommand';
import { commandOptions as addTopicOptions, AddTopicSubCommand } from './addTopicSubCommand';
import { commandOptions as addUserOptions, AddUserSubCommand } from './addUserSubCommand';
import {
    commandOptions as removeChannelOptions,
    RemoveChannelSubCommand,
} from './removeChannelSubCommand';
import { commandOptions as removeRoleOptions, RemoveRoleSubCommand } from './removeRoleSubCommand';
import {
    commandOptions as removeTopicOptions,
    RemoveTopicSubCommand,
} from './removeTopicSubCommand';
import { commandOptions as removeUserOptions, RemoveUserSubCommand } from './removeUserSubCommand';
import {
    commandOptions as setSkullboardEmojiOptions,
    SetSkullboardEmojiSubCommand,
} from './setSkullboardEmoji';
import {
    commandOptions as setSkullboardReactionThresholdOptions,
    SetSkullboardReactionThresholdSubCommand,
} from './setSkullboardReactionThreshold';
import { ViewChannelSubCommand, commandOptions as viewOptions } from './viewSubCommand';
import { commandOptions as viewTopicsOptions, ViewTopicsSubCommand } from './viewTopicsSubCommand';

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
