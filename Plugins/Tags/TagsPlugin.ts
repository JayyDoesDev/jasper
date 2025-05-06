import { definePlugin, Plugin } from '../../Common/define';
import { massRegisterCommands } from '../../Common/register';

export = definePlugin({
    commands: massRegisterCommands(__dirname, ['Commands']),
    description: 'Tags for the No Text To Speech support team!',
    events: [],
    name: 'tags',
    public_plugin: true,
}) satisfies Plugin;
