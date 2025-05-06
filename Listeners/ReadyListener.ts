import { defineEvent } from '../Common/define';
import { updateSubCountChannel } from '../Common/youtube';
import { Context } from '../Source/Context';

import { Listener } from './Listener';

export default class ReadyListener extends Listener<'ready'> {
    constructor(ctx: Context) {
        super(ctx, 'ready', true);
    }

    public execute(): void {
        if (this.ctx.env.get('sub_update') === '1') {
            updateSubCountChannel(this.ctx);
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
