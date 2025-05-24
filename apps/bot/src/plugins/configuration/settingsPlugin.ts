import { definePlugin, Plugin } from '../../define';
import { massRegisterCommands } from '../../register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['commands']),
    description: 'Settings you can change in Jasper for your liking.',
    events: [],
    name: 'settings',
    public_plugin: true,
}) satisfies Plugin;
