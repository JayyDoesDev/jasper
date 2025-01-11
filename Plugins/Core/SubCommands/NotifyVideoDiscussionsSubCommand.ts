import { ApplicationCommandOptions, ApplicationCommandOptionType } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { RegisterSubCommand } from "../../../Common/RegisterSubCommand";
import fs from "fs";
import path from "path";
import { writeToThreadIdFile, writeToVideoIdFile } from "../../../Source";
import { getLatestYoutubeVideo, getRandomYoutubeAPIKey } from "../../../Common/youtube";

export const NotifyVideoDiscussionsSubCommand: ApplicationCommandOptions = {
    name: "notify_video_discussions",
    description: "Notify about video discussions!",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: []
} as ApplicationCommandOptions;

export async function RunNotifyVideoDiscussionsSubCommand(ctx: Context, interaction: ChatInputCommandInteraction) {
    await RegisterSubCommand({
        subCommand: "notify_video_discussions",
        ctx: ctx,
        interaction: interaction,
        callback: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            if (!fs.existsSync("latestvideo.json")) fs.writeFileSync("latestvideo.json", JSON.stringify({ video: "" }));
            if (!fs.existsSync("latestthread.json")) fs.writeFileSync("latestthread.json", JSON.stringify({ thread: "" }));

            const latestVideoPath = path.join(process.cwd(), "latestvideo.json");
            const latestThreadPath = path.join(process.cwd(), "latestthread.json");

            delete require.cache[require.resolve(latestVideoPath)];
            delete require.cache[require.resolve(latestThreadPath)];

            const latestVideoFile: { video: string } = require(latestVideoPath);
            const latest = await getLatestYoutubeVideo(ctx.env.get("youtube_id"), getRandomYoutubeAPIKey(ctx));

            if (latestVideoFile.video !== latest.id) {
                //@ts-ignore
                const channel: TextChannel = ctx.channels.resolve(ctx.env.get("youtube_post_channel"));
                if (!channel) {
                    return interaction.reply({ content: "Could not find the video discussions channel.", ephemeral: true });
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
                        return interaction.reply({ content: "Latest video now posted.", ephemeral: true });
                    } else {
                        return interaction.reply({ content: "Latest video already posted.", ephemeral: true });
                    }
                } catch (err) {
                    console.error('Error sending message or creating thread:', err);
                    if (channel) {
                        channel.send({ content: "An error happened when fetching the latest video." });
                    }
                }
            } else {
                return interaction.reply({ content: "It looks like the most recent video has already been posted.", ephemeral: true });
            }
        }
    })
}