import { Context } from "../Source/Context";
import { sync } from "glob";
import path from "path";
import { ICommand } from "@antibot/interactions";
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";
import { Combine } from "../Common/types";
import { Command, Plugin } from "../Common/define";

export default function (ctx: Context): void {
  let commands: string[] = []
  process.platform == "linux" ? commands = sync("./Plugins/**/*.js") : commands = sync("./dist/Plugins/**/*.js");

    for (let i = 0; i < commands.length; i++) {
        const filePath = path.resolve(commands[i]);
        const file: Combine<[NodeRequire, Record<"commands", []>]> | Plugin = require(filePath);

        if (!file.name || !file.commands) {
            continue;
        }

        if ('public_plugin' in file) {
            if (file.commands) {
                ctx.plugin.set(file.name, file);
                for (let j = 0; j < file.commands.length; j++) {
                    const command: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction> = file.commands[j];
                    ctx.interactions.set(command.command.name, command);
                }
            }
        }
    }

    const commandArray: ICommand[] = [];
    ctx.interactions.forEach((x) => { commandArray.push(x.command); });
    ctx.env.get("guild_only") == "1" ? ctx.interact.overwriteGuildCommands(ctx.env.get("guild_only_commands_id"), ...commandArray) : ctx.interact.overwriteGlobalCommands(...commandArray);
}
