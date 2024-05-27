import { Interaction } from "discord.js";
import { Context } from "../Context";

export interface Event {
    event: {
        name: string;
        once: boolean;
    };
    on: (Event: Interaction | any, ctx: Context) => void;
}

export function DefineEvent(options: Event): Event {
    return options;
}
