/* eslint @typescript-eslint/no-explicit-any: "off" */
import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, PermissionsBitField } from "discord.js";
import { Context } from "../Source/Context";
import { ICommand } from "@antibot/interactions";

export interface Command<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction> {
    command: ICommand;
    permissions?: PermissionsBitField[] | any[];
    on: (ctx: Context, interaction: Interaction) => void;
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => void;
}

export function DefineCommand<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction>(options: Command<Interaction>): Command<Interaction> {
    return options;
}
