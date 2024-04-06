import { Interaction, PermissionsBitField } from "discord.js";
import { Context } from "../Context";
import { ICommand } from "@antibot/interactions";

export interface Command {
	command: ICommand;
	permissions?: PermissionsBitField[] | any[];
	on: (ctx: Context, interaction: Interaction) => void;
}

export function DefineCommand(options: Command): Command {
	return options;
}
