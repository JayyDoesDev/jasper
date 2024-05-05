import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { TagCommand, TagCreateModal, TagEditModal, TagEvent, ResolvedCommand } from "../../Tags";

export = DefinePlugin({
  name: "tags",
  description: "Tags for the No Text To Speech support team!",
  commands: [TagCommand],
  events: [TagCreateModal, TagEditModal, TagEvent],
  public_plugin: true
}, {
  name: "resolved",
  description: "Marks post as resolved and sends a message to inform OP",
  commands: [ResolvedCommand],
  events: [],
  public_plugin: true
}) as Plugin;
