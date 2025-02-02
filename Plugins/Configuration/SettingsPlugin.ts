import { definePlugin, Plugin } from '../../Common/define';
import { massRegisterCommands } from '../../Common/register';

export = definePlugin({
    name: 'settings',
    description: 'Settings you can change in Jasper for your liking.',
    commands: massRegisterCommands(__dirname, ['Commands']),
    public_plugin: true,
}) satisfies Plugin;
