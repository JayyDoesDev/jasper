import { definePlugin, Plugin } from '../../define';
import { massRegisterCommands } from '../../register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['commands']),
    description: 'Tags for the No Text To Speech support team!',
    events: [],
    name: 'tags',
    public_plugin: true,
}) satisfies Plugin;
