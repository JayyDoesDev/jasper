import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { MassRegisterCommands } from "../../Common/MassRegisterCommands";
import { MassRegisterEvents } from "../../Common/MassRegisterEvents";

export = DefinePlugin({
    name: "youtube",
    description: "To do things like force notify about videos.",
    commands: MassRegisterCommands(__dirname, ["Commands"]),
    events: MassRegisterEvents(__dirname, ["Events", "Modals", "Buttons"]),
    public_plugin: true,
}) as Plugin;

