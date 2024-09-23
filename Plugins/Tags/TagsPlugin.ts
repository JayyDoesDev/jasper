import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { MassRegisterCommands } from "../../Common/MassRegisterCommands";
import { MassRegisterEvents } from "../../Common/MassRegisterEvents";

export = DefinePlugin({
    name: "tags",
    description: "Tags for the No Text To Speech support team!",
    commands: MassRegisterCommands(__dirname, ["Commands"]),
    events: MassRegisterEvents(__dirname, ["Events", "Modals", "Buttons"]),
    public_plugin: true,
}) satisfies Plugin;


