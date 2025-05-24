import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Command, Env } from 'src/types';
import { createMessageResponse } from 'src/utils/responses';

export default {
    commands: [
        {
            default_member_permissions: undefined,
            description: 'Get an invite link to add the bot to your server',
            dm_permission: false,
            handler: async (env: Env, interaction: APIChatInputApplicationCommandInteraction) => {
                const applicationId = env.BOT_ID;
                const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
                return createMessageResponse(INVITE_URL, true);
            },
            name: 'invite'
        },
    ]
} as Record<'commands', Command[]>;
