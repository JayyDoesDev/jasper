import { Context } from "./Context";
import { config } from "dotenv";
import { SetupMongo } from "./SetupMongo";
import numeral from "numeral";

config();
const ctx: Context = new Context();
async function main() {

  const handlers = ["Command", "Event"].map(async (x) => {
    const handlerModule = await import(`../Handlers/${x}`);
    await handlerModule.default(ctx);
  });

  await Promise.all(handlers);

  SetupMongo({ uri: process.env.MONGODB });

  process.env.YOUTUBE_CHANNEL_ID && process.env.YOUTUBE_KEY && setInterval(async () => {
    const data = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${process.env.YOUTUBE_CHANNEL_ID}&key=${process.env.YOUTUBE_KEY}`);
    const json = await data.json();
    const subscriberCount: string = numeral(json.items[0].statistics.subscriberCount).format('0.00a');
    // @ts-ignore
    void ctx.channels.cache.get(process.env.SUB_COUNT_CHANNEL).setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
  }, Number(process.env.SUB_COUNT_TIMER));
}

main().catch(console.error);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

void ctx.login(process.env.TOKEN);
