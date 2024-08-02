/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Command } from "./DefineCommand";
import { Event } from "./DefineEvent"
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";

export interface Plugin {
    name: string;
    description: string;
    commands: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[];
    events?: Event<any>[]
    public_plugin: boolean;
}

export function DefinePlugin(options: Plugin): Plugin {
    return options;
}
