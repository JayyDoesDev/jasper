import { definePlugin, Plugin } from '../../Common/define';
import { massRegisterCommands } from '../../Common/register';
import PingCommand from '../../Javascript/CoreCommands.cjs';

export = definePlugin({
    commands: [...massRegisterCommands(__dirname, ['Commands']), ...[PingCommand.Command]],
    description: 'Core process.',
    events: [],
    name: 'Core',
    public_plugin: true,
}) satisfies Plugin;
