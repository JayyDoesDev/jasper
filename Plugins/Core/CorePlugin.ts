import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import PingCommand from "../../Javascript/CoreCommands.cjs";
import { MassRegisterCommands } from "../../Common/MassRegisterCommands";
import { MassRegisterEvents } from "../../Common/MassRegisterEvents";

export = DefinePlugin({
    name: "Core",
    description: "Core process.",
    commands: [...MassRegisterCommands(__dirname, ["Commands"]), ...[PingCommand.Command]],
    events: MassRegisterEvents(__dirname, ["Events"]),
    public_plugin: true,
}) as Plugin;

