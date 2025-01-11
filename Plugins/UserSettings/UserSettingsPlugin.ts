import { definePlugin, Plugin } from "../../Common/define";
import { massRegisterCommands, massRegisterEvents } from "../../Common/register";

export = definePlugin({
    name: "User Settings",
    description: "Settings for users to configure!",
    commands: massRegisterCommands(__dirname, ["Commands"]),
    events: massRegisterEvents(__dirname, ["Events"]),
    public_plugin: true
}) satisfies Plugin;