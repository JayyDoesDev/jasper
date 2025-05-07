import { AWW_COMMAND, INVITE_COMMAND } from './definitions';

export const commands = [
    AWW_COMMAND,
    INVITE_COMMAND
] as const;

export type CommandName = typeof commands[number]['name'];
