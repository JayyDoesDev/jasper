import { ActivityType } from "discord.js";
import { Context } from "../../../Source/Context";
import numeral from "numeral";
import { DefineEvent } from "../../../Common/DefineEvent";

export = {
  Event:  DefineEvent({
    event: {
        name: "ready",
        once: true,
    },
    on: (ctx: Context) => {
        if (ctx.env.get("sub_update") == "1") {
            (async () => {
                const data = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ ctx.env.get("youtube_id") }&key=${ ctx.env.get("youtube_key_regular") }`);
                data.json().then((x) => {
                  const subscriberCount: string = numeral(x.items[0].statistics.subscriberCount).format('0.00a');
                  //@ts-ignore
                  void ctx.channels.cache.get(ctx.env.get("sub_count_channel")).setName(`\u{1F4FA} \u{FF5C} Sub Count: ${ subscriberCount }`);
              })
            })();
        }
        console.log(`${ ctx.user.username } has logged in!`);
        ctx.user.setPresence({
            activities: [
                {
                    type: ActivityType.Custom,
                    name: "custom",
                    state: "jasper",
                },
            ],
        });
      },
  })
}
