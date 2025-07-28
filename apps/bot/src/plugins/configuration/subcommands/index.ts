import { commandOptions as addActionOptions, AddActionSubCommand } from './addActionSubCommand';
import { commandOptions as addChannelOptions, AddChannelSubCommand } from './addChannelSubCommand';
import { commandOptions as addObjectOptions, AddObjectSubCommand } from './addObjectSubCommand';
import { commandOptions as addRoleOptions, AddRoleSubCommand } from './addRoleSubCommand';
import {
    commandOptions as addSkullboardChannelOptions,
    AddSkullboardChannelSubCommand,
} from './addSkullboardChannelSubCommand';
import { commandOptions as addTopicOptions, AddTopicSubCommand } from './addTopicSubCommand';
import { commandOptions as addUserOptions, AddUserSubCommand } from './addUserSubCommand';
import {
    commandOptions as removeActionOptions,
    RemoveActionSubCommand,
} from './removeActionSubCommand';
import {
    commandOptions as removeChannelOptions,
    RemoveChannelSubCommand,
} from './removeChannelSubCommand';
import {
    commandOptions as removeObjectOptions,
    RemoveObjectSubCommand,
} from './removeObjectSubCommand';
import { commandOptions as removeRoleOptions, RemoveRoleSubCommand } from './removeRoleSubCommand';
import {
    commandOptions as removeTopicOptions,
    RemoveTopicSubCommand,
} from './removeTopicSubCommand';
import { commandOptions as removeUserOptions, RemoveUserSubCommand } from './removeUserSubCommand';
import {
    commandOptions as setGraceTimeOptions,
    SetGraceTimeSubCommand,
} from './setGraceTimeSubCommand';
import {
    commandOptions as setSkullboardEmojiOptions,
    SetSkullboardEmojiSubCommand,
} from './setSkullboardEmoji';
import {
    commandOptions as setSkullboardReactionThresholdOptions,
    SetSkullboardReactionThresholdSubCommand,
} from './setSkullboardReactionThreshold';
import {
    commandOptions as setWarningCheckOptions,
    SetWarningCheckSubCommand,
} from './setWarningCheckSubCommand';
import {
    commandOptions as setWarningTimeOptions,
    SetWarningTimeSubCommand,
} from './setWarningTimeSubCommand';
import { commandOptions as viewActionOptions, ViewActionSubCommand } from './viewActionsSubCommand';
import { ViewChannelSubCommand, commandOptions as viewOptions } from './viewSubCommand';
import { commandOptions as viewTopicsOptions, ViewTopicsSubCommand } from './viewTopicsSubCommand';

export const subCommandOptions = [
    addActionOptions,
    removeActionOptions,
    addChannelOptions,
    removeChannelOptions,
    addObjectOptions,
    removeObjectOptions,
    addRoleOptions,
    removeRoleOptions,
    viewOptions,
    addTopicOptions,
    removeTopicOptions,
    viewTopicsOptions,
    viewActionOptions,
    addUserOptions,
    removeUserOptions,
    addSkullboardChannelOptions,
    setSkullboardEmojiOptions,
    setSkullboardReactionThresholdOptions,
    setWarningCheckOptions,
    setWarningTimeOptions,
    setGraceTimeOptions,
];

export {
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
    SetGraceTimeSubCommand,
    SetSkullboardEmojiSubCommand,
    SetSkullboardReactionThresholdSubCommand,
    SetWarningCheckSubCommand,
    SetWarningTimeSubCommand,
    ViewActionSubCommand,
    ViewChannelSubCommand,
    ViewTopicsSubCommand,
};
