import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { TagCommand } from "../../Tags";

export = DefinePlugin({
  name: "tags",
  description: "Tags for the No Text To Speech support team!",
  commands: [TagCommand],
  events: [],
  public_plugin: true
}) as Plugin;
