import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { HelpCommand, ResolveCommand, TagCommand, TagCreateModal, TagEditModal } from ".";
import { ListSubCommandHomeButton, ListSubCommandNextButton, ListSubCommandPreviousButton } from "./SubCommands";

export = DefinePlugin({
    name: "tags",
    description: "Tags for the No Text To Speech support team!",
    commands: [ TagCommand, ResolveCommand, HelpCommand ],
    events: [ TagCreateModal, TagEditModal, ListSubCommandNextButton, ListSubCommandHomeButton, ListSubCommandPreviousButton ],
    public_plugin: true,
}) as Plugin;
