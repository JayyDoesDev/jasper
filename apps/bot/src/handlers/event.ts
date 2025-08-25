import path from 'path';

import { sync } from 'glob';

import { Context } from '../classes/context';
import { Plugin } from '../define';
import { Combine } from '../types';

type FileRequire =
    | Combine<
          [
              NodeRequire,
              Record<
                  'events',
                  {
                      event: { name: string; on: (args: [], ctx: Context) => void };
                  }[]
              >,
              Record<'commands', []>,
          ]
      >
    | Plugin;

export default function (ctx: Context): void {
    try {
        const events: string[] = sync('./dist/plugins/**/*.js');

        for (let i = 0; i < events.length; i++) {
            try {
                const filePath = path.resolve(events[i]);
                const file: FileRequire = require(filePath);
                if (file.events || file.commands) {
                    file.events.forEach((x) => {
                        if (x.once !== true) {
                            ctx.on(x.event.name, (...args) => x.on(...args, ctx));
                        } else {
                            ctx.once(x.event.name, (...args) => x.on(...args, ctx));
                        }
                    });
                }
            } catch (error) {
                console.error(`Error loading file ${events[i]}: ${error.message}`);
            }
        }
    } catch (error) {
        console.error(`Error during glob operation: ${error.message}`);
    }
}
