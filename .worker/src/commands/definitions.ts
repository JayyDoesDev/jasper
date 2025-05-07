import { Command } from '../types';

// modeled off of an offical Discord code example
export const AWW_COMMAND: Command = {
    default_member_permissions: undefined,
    description: 'Drop some cuteness on this channel.',
    dm_permission: true,
    name: 'awwww'
};

export const INVITE_COMMAND: Command = {
    default_member_permissions: undefined,
    description: 'Get an invite link to add the bot to your server',
    dm_permission: false,
    name: 'invite'
};
