import { Context } from '../classes/context';
import { defineEvent } from '../define';
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
