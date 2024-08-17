/* eslint @typescript-eslint/no-explicit-any: "off" */
import { ActivityType } from "discord.js";
import { Context } from "../../../Source/Context";
import { DefineEvent } from "../../../Common/DefineEvent";
import { updateSubCountChannel } from "../../../Source";

export = {
  Event:  DefineEvent({
    event: {
        name: "ready",
        once: true,
    },
    on: (ctx: Context) => {
        if (ctx.env.get("sub_update") == "1") updateSubCountChannel();
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
