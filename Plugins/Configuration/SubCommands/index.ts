import { commandOptions as addChannelOptions, AddChannelSubCommand } from './AddChannelSubCommand';
import {
    commandOptions as removeChannelOptions,
    RemoveChannelSubCommand,
} from './RemoveChannelSubCommand';

export const subCommandOptions = [addChannelOptions, removeChannelOptions];

export { AddChannelSubCommand, RemoveChannelSubCommand };
