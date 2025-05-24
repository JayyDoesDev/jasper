import { ClientEvents } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { Listener } from './listener';

interface NetworkError extends Error {
    method?: string;
    url?: string;
}

export default class ErrorListener extends Listener<'error'> {
    constructor(ctx: Context) {
        super(ctx, 'error', false);
    }

    public execute(error: ClientEvents['error'][0]): void {
        const networkError = error as NetworkError;
        if (networkError.method && networkError.url) {
            console.log(
                `Error: ${error}\nMethod: ${networkError.method}\nUrl: ${networkError.url}`,
            );
        } else {
            console.log(`Error: ${error.stack}`);
        }
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: (error: Error) => this.execute(error),
        });
    }
}
