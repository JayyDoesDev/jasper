import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { HelpCommand, ResolveCommand, TagCommand, TagCreateModal, TagEditModal, TagEvent } from ".";

export = DefinePlugin({
    name: "tags",
    description: "Tags for the No Text To Speech support team!",
    commands: [ TagCommand, ResolveCommand, HelpCommand ],
    events: [ TagCreateModal, TagEditModal, TagEvent ],
    public_plugin: true,
}) as Plugin;
