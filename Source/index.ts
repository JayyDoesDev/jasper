import { Context } from "./Context";
import { config } from "dotenv";
import { SetupMongo } from "./SetupMongo";
import numeral from "numeral";

config();
const ctx: Context = new Context();
ctx.env.validate();

async function main() {

  const handlers = ["Command", "Event"].map(async (x) => {
    const handlerModule = await import(`../Handlers/${x}`);
    await handlerModule.default(ctx);
  });

  await Promise.all(handlers);

  SetupMongo({ uri: ctx.env.get("db") });

  ctx.env.get("youtube_channel_id") && ctx.env.get("youtube_key_regular") && setInterval(async () => {
    const data = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${ctx.env.get("youtube_id")}&key=${ctx.env.get("youtube_key_regular")}`);
    const json = await data.json();
    const subscriberCount: string = numeral(json.items[0].statistics.subscriberCount).format('0.00a');
    // @ts-ignore
    void ctx.channels.cache.get(ctx.env.get("sub_count_channel")).setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
  }, Number(ctx.env.get("sub_timer")));
}

main().catch(console.error);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

void ctx.login(ctx.env.get("botToken"));
