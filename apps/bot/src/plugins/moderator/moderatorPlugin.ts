import { definePlugin, Plugin } from '../../define';
import { massRegisterCommands } from '../../register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['commands']),
    description: 'Moderation commands for the No Text To Speech support team!',
    events: [],
    name: 'moderator',
    public_plugin: true,
}) satisfies Plugin;
