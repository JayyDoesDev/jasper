/* eslint @typescript-eslint/no-explicit-any: "off" */
import * as Path from "path";
import glob from "glob";
import { Event } from "./DefineEvent";

export function MassRegisterEvents<T>(dir: string, paths: string[]): Event<T>[] {
  const commands: any[] = [];

  for (const path of paths) {
    const matchedPaths: string[] = glob.sync(Path.join(Path.join(dir, path), "**/**/*.js"));
    for (const folder of matchedPaths) {
      const module = require(Path.resolve(folder));
      commands.push(module.Event);
    }
  }

  return commands;
}
