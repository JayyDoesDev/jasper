import { definePlugin, Plugin } from '../../define';
import PingCommand from '../../javascript/coreCommands.cjs';
import { massRegisterCommands } from '../../register';

export = definePlugin({
    commands: [...massRegisterCommands(__dirname, ['commands']), ...[PingCommand.Command]],
    description: 'Core process.',
    events: [],
    name: 'Core',
    public_plugin: true,
}) satisfies Plugin;
