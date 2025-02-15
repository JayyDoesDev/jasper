import { definePlugin, Plugin } from '../../Common/define';
import PingCommand from '../../Javascript/CoreCommands.cjs';
import { massRegisterCommands } from '../../Common/register';

export = definePlugin({
    name: 'Core',
    description: 'Core process.',
    commands: [...massRegisterCommands(__dirname, ['Commands']), ...[PingCommand.Command]],
    events: [],
    public_plugin: true,
}) satisfies Plugin;
