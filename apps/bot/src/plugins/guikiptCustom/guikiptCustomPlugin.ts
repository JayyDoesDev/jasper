import { definePlugin, Plugin } from '../../define';
import { massRegisterCommands } from '../../register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['commands']),
    description: 'Custom plugin for guikipt for testing purposes.',
    events: [],
    name: 'guikiptCustom',
    public_plugin: true,
}) satisfies Plugin;
