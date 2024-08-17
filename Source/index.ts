/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from "./Context";
import { config } from "dotenv";
import { SetupMongo } from "./SetupMongo";
import numeral from "numeral";

config();
const ctx: Context = new Context();
ctx.env.validate();

async function getYoutubeChannel<T>(youtubeId: string, apiKey: string): Promise<T> {
    return await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apiKey}`) as T;
}

export async function getLatestYoutubeVideo(youtubeId: string, apiKey: string): Promise<{ id: string; title: string; description: string; thumbnail: string; channel: string; }> {
    const data = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeId}&maxResults=1&order=date&type=video&key=${apiKey}`);
    const json = await data.json();
    return { id: json.items[0].id.videoId, title: json.items[0].snippet.title, description: json.items[0].snippet.description, thumbnail: json.items[0].snippet.thumbnails.high.url, channel: json.items[0].snippet.channelTitle };
}

export async function updateSubCountChannel() {
    const data = await getYoutubeChannel<any>(ctx.env.get("youtube_id"), ctx.env.get("youtube_key_regular"));
    const json = await data.json();
    const subscriberCount: string = numeral(json.items[0].statistics.subscriberCount).format('0.00a');
    // @ts-ignore
    void ctx.channels.cache.get(ctx.env.get("sub_count_channel")).setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
}

async function main() {

  const handlers = ["Command", "Event"].map(async (x) => {
    const handlerModule = await import(`../Handlers/${x}`);
    await handlerModule.default(ctx);
  });

  await Promise.all(handlers);

  SetupMongo({ uri: ctx.env.get("db") });
}

if (ctx.env.get("sub_update") == "1") setInterval(updateSubCountChannel, ctx.env.get("sub_timer"));


main().catch(console.error);

process
  .on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
  })

  .on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
  });

void ctx.login(ctx.env.get("botToken"));
