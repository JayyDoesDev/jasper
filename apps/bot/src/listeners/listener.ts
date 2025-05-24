import { ClientEvents } from 'discord.js';

import { Context } from '../classes/context';

export abstract class Listener<K extends keyof ClientEvents> {
    constructor(
        public readonly ctx: Context,
        public readonly name: K,
        public readonly once: boolean = false,
    ) {}

    public abstract execute(...args: ClientEvents[K]): Promise<void> | void;
}
