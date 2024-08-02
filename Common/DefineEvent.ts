import { Interaction } from "discord.js";
import { Context } from "../Source/Context";

export interface Event<T> {
    event: {
        name: string;
        once: boolean;
    };
    on: (event: Interaction | T, ctx: Context) => void;
}

export function DefineEvent<T>(options: Event<T>): Event<T> {
    return options;
}
