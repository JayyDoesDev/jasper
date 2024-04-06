import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { TagCommand, TagCreateModal } from "../../Tags";

export = DefinePlugin({
  name: "tags",
  description: "Tags for the No Text To Speech support team!",
  commands: [TagCommand],
  events: [TagCreateModal],
  public_plugin: true
}) as Plugin;
