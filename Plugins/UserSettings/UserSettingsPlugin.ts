import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { MassRegisterCommands } from "../../Common/MassRegisterCommands";
import { MassRegisterEvents } from "../../Common/MassRegisterEvents";

export = DefinePlugin({
    name: "User Settings",
    description: "Settings for users to configure!",
    commands: MassRegisterCommands(__dirname, ["Commands"]),
    events: MassRegisterEvents(__dirname, ["Events"]),
    public_plugin: true
}) as Plugin;