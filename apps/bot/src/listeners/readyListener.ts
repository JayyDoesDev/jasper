import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { cleanUpExpiredThreads, cleanUpInactiveThreads } from '../threadInactiveCheck';
import { updateSubCountChannel } from '../youtube';

import { Listener } from './listener';

export default class ReadyListener extends Listener<'ready'> {
    constructor(ctx: Context) {
        super(ctx, 'ready', true);
    }

    public execute(): void {
        if (this.ctx.env.get('sub_update') === '1') {
            updateSubCountChannel(this.ctx, this.ctx.env.get('youtube_id'));
        }
        console.log(`${this.ctx.user.username} has logged in!`);

        setInterval(async () => {
            try {
                await cleanUpExpiredThreads(this.ctx);
                await cleanUpInactiveThreads(this.ctx);
            }
            catch (error) {
                console.error('Error during inactive thread check:', error);
            }
        }, 10 * 1000);
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: () => this.execute(),
        });
    }
}
