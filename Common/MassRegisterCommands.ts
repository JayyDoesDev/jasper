import * as Path from "path";
import glob from "glob";
import { Command } from "./DefineCommand";
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";

export function MassRegisterCommands(dir: string, paths: string[]): Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[] {
  const commands: any[] = [];

  for (const path of paths) {
    const matchedPaths: string[] = glob.sync(Path.join(Path.join(dir, path), "**/**/*.js"));
    for (const folder of matchedPaths) {
      const module = require(Path.resolve(folder));
      commands.push(module.Command);
    }
  }

  return commands;
}
