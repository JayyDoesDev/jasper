import { Context } from "../../Source/Context";
import { Message, TextChannel } from "discord.js";
import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";

let active: boolean = false;
let messageCount: number = 0;
let messageWindowStart: number = Date.now();
let lastSlowmodeChange: number = 0;

export = DefinePlugin({
    name: "slowmode",
    description: "Automatically change slowmode based on chat activity!",
    events: [
        {
            event: {
                name: "messageCreate",
                once: false
            },
            on: async (message: Message, ctx: Context) => {
                if (ctx.env.get("slowmode") == "0") return;

                //@ts-ignore
                const channel: TextChannel = ctx.channels.resolve(ctx.env.get("slowmode_channel"));

                if (message.channel.id !== channel.id) return;
                if (Date.now() - messageWindowStart > global.messageTimeWindow) {
                    messageCount = 1;
                    messageWindowStart = Date.now();
                } else {
                    messageCount += 1;
                }

                if (messageCount >= global.messageThreshold) {
                    const multiplier: number = Math.max(Math.floor(messageCount / 3.5), 1);

                    const currentTime = Date.now();
                    if (currentTime - lastSlowmodeChange > global.slowmodeCooldown) {
                        lastSlowmodeChange = currentTime;
                        await channel.setRateLimitPerUser(multiplier).catch(() => { return; });

                        if (!active) {
                            active = true;

                            setTimeout(async () => {
                                await channel.setRateLimitPerUser(0).catch(() => { return; });
                                active = false;
                            }, ctx.env.get("slowmode_reset_time"));
                        }
                    }
                }
            }
        }
    ],
    public_plugin: true,
    commands: []
}) satisfies Plugin;
