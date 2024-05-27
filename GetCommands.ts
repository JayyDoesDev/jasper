/* BETA */
import { Command } from "./Common/DefineCommand";
import glob from "glob";
import * as pt from "path"
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";

export function GetCommands(path: string): Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[] {
    const commands: string[] = glob.sync(process.cwd() + `/dist/${ path }` + "/**/**/*.js");
    const array: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[] = [];
    for (let i = 0; i < commands.length; i++) {
        const file: any = require(pt.resolve(commands[i]));
        array.push(file)
    }
    return array;
}
