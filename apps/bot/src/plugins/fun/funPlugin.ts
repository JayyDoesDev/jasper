import { definePlugin, Plugin } from '../../define';
import { massRegisterCommands } from '../../register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['commands']),
    description: 'A variety of different fun commands!',
    events: [],
    name: 'fun',
    public_plugin: true,
}) satisfies Plugin;
