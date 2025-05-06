import { definePlugin, Plugin } from '../../Common/define';
import { massRegisterCommands } from '../../Common/register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['Commands']),
    description: 'Settings you can change in Jasper for your liking.',
    events: [],
    name: 'settings',
    public_plugin: true,
}) satisfies Plugin;
