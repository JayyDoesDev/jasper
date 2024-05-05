import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { TagCommand, TagCreateModal, TagEditModal, TagEvent, ResolvedCommand } from "../../Tags";

export = DefinePlugin({
  name: "tags",
  description: "Tags for the No Text To Speech support team!",
  commands: [TagCommand, ResolvedCommand],
  events: [TagCreateModal, TagEditModal, TagEvent],
  public_plugin: true
}) as Plugin;
