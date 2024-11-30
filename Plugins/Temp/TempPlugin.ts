import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { MassRegisterCommands } from "../../Common/MassRegisterCommands";
import { MassRegisterEvents } from "../../Common/MassRegisterEvents";

export = DefinePlugin({
    name: "temp",
    description: "Temp commands that only exist for one time.",
    commands: MassRegisterCommands(__dirname, ["Commands"]),
    events: MassRegisterEvents(__dirname, ["Buttons", "Modals"]),
    public_plugin: false
}) satisfies Plugin;