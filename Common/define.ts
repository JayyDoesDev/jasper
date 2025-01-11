/* eslint @typescript-eslint/no-explicit-any: "off" */
import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, Interaction, PermissionsBitField } from "discord.js";
import { Context } from "../Source/Context";
import { ICommand } from "@antibot/interactions";

export interface Command<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction> {
    command: ICommand;
    permissions?: PermissionsBitField[] | any[];
    on: (ctx: Context, interaction: Interaction) => void;
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => void;
}

export interface Event<
    T = Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
    ? Interaction
    : unknown
> {
    event: {
        name: string;
        once: boolean;
    };
    on: (event: T, ctx: Context) => void;
}

export type Plugin = {
    name: string;
    description: string;
    commands: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[];
    events?: Event[];
    public_plugin: boolean;
};

function isCommand<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction>(options: unknown): options is Command<Interaction> {
    return typeof options === 'object' && options !== null && 'command' in options && 'on' in options;
}

function isEvent<T>(options: unknown): options is Event<T> {
    return typeof options === 'object' && options !== null && 'event' in options && 'on' in options;
}

function isPlugin(options: unknown): options is Plugin {
    return typeof options === 'object' && options !== null && 'name' in options && 'commands' in options;
}

export function defineCommand<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction>(options: Command<Interaction>): Command<Interaction> {
    if (isCommand(options)) return options;
    throw new Error("Invalid Command options");
}

export function defineEvent<T>(options: Event<T>): Event<T> {
    if (isEvent(options)) return options;
    throw new Error("Invalid Event options");
}

export function definePlugin(options: Plugin): Plugin {
    if (isPlugin(options)) return options;
    throw new Error("Invalid Plugin options");
}
