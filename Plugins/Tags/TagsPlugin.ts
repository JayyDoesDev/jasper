import { definePlugin, Plugin } from '../../Common/define';
import { massRegisterCommands } from '../../Common/register';

export = definePlugin({
    name: 'tags',
    description: 'Tags for the No Text To Speech support team!',
    commands: massRegisterCommands(__dirname, ['Commands']),
    events: [],
    public_plugin: true,
}) satisfies Plugin;
