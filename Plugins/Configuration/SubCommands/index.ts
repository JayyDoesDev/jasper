import { commandOptions as addChannelOptions, AddChannelSubCommand } from './AddChannelSubCommand';
import {
    commandOptions as removeChannelOptions,
    RemoveChannelSubCommand,
} from './RemoveChannelSubCommand';
import { commandOptions as addRoleOptions, AddRoleSubCommand } from './AddRoleSubCommand';
import { commandOptions as removeRoleOptions, RemoveRoleSubCommand } from './RemoveRoleSubCommand';

export const subCommandOptions = [
    addChannelOptions,
    removeChannelOptions,
    addRoleOptions,
    removeRoleOptions,
];

export { AddChannelSubCommand, RemoveChannelSubCommand, AddRoleSubCommand, RemoveRoleSubCommand };
