import { Context } from "../../../Source/Context";
import { defineEvent } from "../../../Common/define";
import { updateSubCountChannel } from "../../../Common/youtube";

export = {
  Event:  defineEvent({
    event: {
        name: "ready",
        once: true,
    },
    on: (ctx: Context) => {
        if (ctx.env.get("sub_update") == "1") updateSubCountChannel(ctx);
        console.log(`${ ctx.user.username } has logged in!`);
      },
  })
}
