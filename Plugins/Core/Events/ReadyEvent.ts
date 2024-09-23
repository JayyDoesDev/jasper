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
      },
  })
}
