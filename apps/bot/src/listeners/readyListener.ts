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

        const supportInactiveCheck = this.ctx.env.get('support_inactive_check');
        const supportInactiveWarningTime = this.ctx.env.get('support_inactive_warning_time');
        const supportInactiveGraceTime = this.ctx.env.get('support_inactive_grace_time');

        if (supportInactiveCheck !== '1' && supportInactiveCheck?.toLowerCase() !== 'true') {
            console.log('Support inactive check is disabled. Skipping inactive thread monitoring.');
        } else if (!supportInactiveWarningTime || isNaN(Number(supportInactiveWarningTime)) || Number(supportInactiveWarningTime) <= 0) {
            console.warn('Invalid or missing support_inactive_warning_time configuration. Skipping inactive thread monitoring.');
        } else if (!supportInactiveGraceTime || isNaN(Number(supportInactiveGraceTime)) || Number(supportInactiveGraceTime) <= 0) {
            console.warn('Invalid or missing support_inactive_grace_time configuration. Skipping inactive thread monitoring.');
        } else {
            console.log('Inactive thread monitoring enabled. Running initial check and then every minute.');

            const warningTime = Number(supportInactiveWarningTime);
            const graceTime = Number(supportInactiveGraceTime);

            (async () => {
                try {
                    await cleanUpExpiredThreads(this.ctx);
                    await cleanUpInactiveThreads(this.ctx, warningTime, graceTime);
                }
                catch (error) {
                    console.error('Error during initial inactive thread check:', error);
                }
            })();

            setInterval(async () => {
                try {
                    await cleanUpExpiredThreads(this.ctx);
                    await cleanUpInactiveThreads(this.ctx, warningTime, graceTime);
                }
                catch (error) {
                    console.error('Error during inactive thread check:', error);
                }
            }, 60 * 1000);
        }
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
