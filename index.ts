import { Context } from "./Context";
import { config } from "dotenv";
import { SetupMongo } from "./SetupMongo";
import numeral from "numeral";
config();
const ctx: Context = new Context();
["Command", "Event"].forEach(async (x) => {
  await require(`./Handlers/${x}`).default(ctx);
});

SetupMongo({ uri: process.env.MONGODB });

setInterval(async () => {
    const data = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${process.env.YOUTUBE_CHANNEL_ID}&key=${process.env.YOUTUBE_KEY}`);
    data.json().then((x) => {
      const subscriberCount: string = numeral(x.items[0].statistics.subscriberCount).format('0.00a');
      ctx.channels.cache.get(process.env.SUB_COUNT_CHANNEL)
        //@ts-ignore
        .setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
    })
}, Number(process.env.SUB_COUNT_TIMER))
ctx.login(process.env.TOKEN);
