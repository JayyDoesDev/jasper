import { Context } from "../Source/Context";
import glob from "glob";
import path from "path";

export default function (ctx: Context): void {
    try {
        let events: string[] = [];
        process.platform == "linux" ? events = glob.sync("./Plugins/**/*.js") : events = glob.sync("./dist/Plugins/**/*.js");
        for (let i = 0; i < events.length; i++) {
            try {
                const filePath = path.resolve(events[i]);
                const file: any = require(filePath);
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
                console.error(`Error loading file ${ events[i] }: ${ error.message }`);
            }
        }
    } catch (error) {
        console.error(`Error during glob operation: ${ error.message }`);
    }
}
