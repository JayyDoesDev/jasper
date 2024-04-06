import { Command } from "./DefineCommand";
import { Event } from "./DefineEvent"

export interface Plugin {
	name: string;
	description: string;
	commands: Command[];
	events?: Event[]
	public_plugin: boolean;
}

export function DefinePlugin(options: Plugin): Plugin {
	return options;
}
