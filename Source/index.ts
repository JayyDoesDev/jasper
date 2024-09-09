/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from "./Context";
import { config } from "dotenv";
import { SetupMongo } from "./SetupMongo";
import numeral from "numeral";
import fs from "fs";
import path from "path";
import { TextChannel } from "discord.js";

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

export async function updateSubCountChannel(): Promise<void> {
    const data = await getYoutubeChannel<{ [key: string]: any }>(ctx.env.get("youtube_id"), getRandomYoutubeAPIKey());
    const json = await data.json();
    const subscriberCount: string = numeral(json.items[0].statistics.subscriberCount).format('0.00a');
    // @ts-ignore
    void ctx.channels.cache.get(ctx.env.get("sub_count_channel")).setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
}

// Not random
export function getRandomYoutubeAPIKey(): string {
  return [ctx.env.get("youtube_key_one"), ctx.env.get("youtube_key_two"), ctx.env.get("youtube_key_three")][Math.floor(Math.random() * 3)];
}

export function writeToVideoIdFile(videoId: string): void {
    try {
      fs.writeFileSync("latestvideo.json", JSON.stringify({ video: videoId }));
    } catch (err) {
      console.error(err);
    }
}

export function writeToThreadIdFile(threadId: string): void {
  try {
    fs.writeFileSync("latestthread.json", JSON.stringify({ thread: threadId }));
  } catch (err) {
    console.error(err);
  }
}

async function postNewVideo(): Promise<void> {
  if (ctx.env.get("youtube_post_update") == "0") return;
  // Ensure the files exist
  if (!fs.existsSync("latestvideo.json")) fs.writeFileSync("latestvideo.json", JSON.stringify({ video: "" }));
  if (!fs.existsSync("latestthread.json")) fs.writeFileSync("latestthread.json", JSON.stringify({ thread: "" }));

  const latestVideoPath = path.join(process.cwd(), "latestvideo.json");
  const latestThreadPath = path.join(process.cwd(), "latestthread.json");

  delete require.cache[require.resolve(latestVideoPath)];
  delete require.cache[require.resolve(latestThreadPath)];

  const latestVideoFile: { video: string } = require(latestVideoPath);
  const latest = await getLatestYoutubeVideo(ctx.env.get("youtube_id"), getRandomYoutubeAPIKey());

  if (latestVideoFile.video !== latest.id) {
      //@ts-ignore
      const channel: TextChannel = ctx.channels.resolve(ctx.env.get("youtube_post_channel"));

      if (!channel) {
          console.error('Channel not found');
          return;
      }

      try {
          const messages = await channel.messages.fetch({ limit: 100 });

          if (!messages.some((message) => message.content.includes(latest.id))) {
              const message = await channel.send({ content: `<@&${ctx.env.get("youtube_video_discussions_role")}>\n# ${latest.title}\n${latest.description}\nhttps://www.youtube.com/watch?v=${latest.id}`, allowedMentions: { roles: [ctx.env.get("youtube_video_discussions_role")] } });

              const thread = await message.startThread({ name: latest.title, autoArchiveDuration: 1440 });
              await thread.send("# Reminder to follow the rules and to stay on topic!");

              const latestThread: { thread: string } = require(latestThreadPath);
              try {
                  const previousThread = channel.threads.resolve(latestThread.thread);
                  await previousThread.edit({ locked: true, name: `[Closed] ${previousThread.name}`, archived: true });
              } catch (error) {
                  console.error('Error fetching or editing previous thread:', error);
              }

              writeToThreadIdFile(thread.id);
              writeToVideoIdFile(latest.id);

          } else {
              console.log('Latest video already posted.');
          }
      } catch (err) {
          console.error('Error sending message or creating thread:', err);
          if (channel) {
              channel.send({ content: "An error happened when fetching the latest video." });
          }
      }
  }
}



async function main() {
  const handlers = ["Command", "Event"].map(async (x) => {
    const handlerModule = await import(`../Handlers/${x}`);
    await handlerModule.default(ctx);
  });

  await Promise.all(handlers);
  
  SetupMongo({ uri: ctx.env.get("db") });
  setInterval(postNewVideo, ctx.env.get("youtube_post_timer"));
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

