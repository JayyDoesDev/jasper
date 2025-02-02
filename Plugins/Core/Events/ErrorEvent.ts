import { defineEvent } from '../../../Common/define';
import { hasProperties } from '../../../Common/types';

export = {
    Event: defineEvent({
        event: {
            name: 'error',
            once: false,
        },
        on: (e: { method: string; url: string }) => {
            if (hasProperties(e, ['method', 'url'])) {
                console.log(`Error: ${e}\nMethod: ${e.method}\nUrl: ${e.url}`);
            }
        },
    }),
};
