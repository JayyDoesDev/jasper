import { definePlugin, Plugin } from '../../Common/define';
import { massRegisterCommands } from '../../Common/register';

export = definePlugin({
    name: 'moderator',
    description: 'Moderation commands for the No Text To Speech support team!',
    commands: massRegisterCommands(__dirname, ['Commands']),
    events: [],
    public_plugin: true,
}) satisfies Plugin;
