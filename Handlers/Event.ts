import { Context } from "../Source/Context";
import { sync } from "glob";
import path from "path";
import { Combine } from "../Common/types";
import { Plugin } from "../Common/define";

export default function (ctx: Context): void {
    try {
        let events: string[] = [];
        process.platform == "linux" ? events = sync("./Plugins/**/*.js") : events = sync("./dist/Plugins/**/*.js");
        for (let i = 0; i < events.length; i++) {
            try {
                const filePath = path.resolve(events[i]);
                const file: Combine<[NodeRequire, Record<"events", { event: { name : string, on: (args: [], ctx: Context) => void }}[]>, Record<"commands", []>]> | Plugin = require(filePath);
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
