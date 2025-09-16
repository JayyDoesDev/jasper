import fs from 'fs/promises';
import path from 'path';

import { TextChannel } from 'discord.js';
import { config } from 'dotenv';
import mongoose from 'mongoose';

/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from './classes/context';
import { initializeDatabase } from './database/connection';
import { getLatestYoutubeVideo, updateSubCountChannel } from './youtube';

config();

const ctx: Context = new Context();
ctx.env.validate();

// Application configuration
const CONFIG = {
    embedColor: 0x323338,
    paths: {
        latestThread: path.join(process.cwd(), 'latestthread.json'),
        latestVideo: path.join(process.cwd(), 'latestvideo.json'),
    },
    slowmode: {
        cooldown: ctx.env.get('slowmode_cooldown'),
        messageThreshold: ctx.env.get('slowmode_msg_threshold'),
        messageTimeWindow: ctx.env.get('slowmode_msg_time'),
    },
} as const;

global.slowmodeCooldown = CONFIG.slowmode.cooldown;
global.messageTimeWindow = CONFIG.slowmode.messageTimeWindow;
global.messageThreshold = CONFIG.slowmode.messageThreshold;
global.embedColor = CONFIG.embedColor;

async function main() {
    try {
        await Promise.all(
            ['command', 'event', 'listener'].map(async (x) => {
                const handlerModule = await import(`./handlers/${x}`);
                console.log(handlerModule);
                return handlerModule.default(ctx);
            }),
        );

        // Initialize database with the new abstraction layer
        await initializeDatabase(ctx);

        setInterval(postNewVideo, Number(ctx.env.get('youtube_post_timer')) * 1000);

        if (ctx.env.get('sub_update') === '1') {
            setInterval(
                updateSubCountChannel,
                Number(ctx.env.get('sub_timer')) * 1000,
                ctx,
                ctx.env.get('youtube_channel_id'),
            );
        }

        await ctx.login(ctx.env.get('botToken'));
    } catch (error) {
        console.error('Error in main:', error);
        process.exit(1);
    }
}

async function postNewVideo(): Promise<void> {
    if (ctx.env.get('youtube_post_update') === '0') return;

    try {
        const latest = (await getLatestYoutubeVideo(ctx, ctx.env.get('youtube_id'))).latest_video;

        const channel = ctx.channels.resolve(ctx.env.get('youtube_post_channel')) as TextChannel;
        if (!channel) {
            console.error('YouTube post channel not found');
            return;
        }

        let currentVideoId: string | undefined;
        try {
            const data = await fs.readFile(CONFIG.paths.latestVideo, 'utf-8');
            currentVideoId = JSON.parse(data).video;
        } catch (err) {
            console.log(err);
        }

        if (currentVideoId === latest.videoId) {
            return;
        }

        const messages = await channel.messages.fetch({ limit: 100 });
        if (messages.some((message) => message.content.includes(latest.videoUrl))) {
            console.log('Latest video already posted.');
            return;
        }

        const message = await channel.send({
            allowedMentions: { roles: [ctx.env.get('youtube_video_discussions_role')] },
            content: `<@&${ctx.env.get('youtube_video_discussions_role')}>\n# ${latest.title}\n${
                latest.description
            }\n${latest.videoUrl}`,
        });

        const thread = await message.startThread({
            autoArchiveDuration: 1440,
            name: latest.title,
        });

        await thread.send('# Reminder to follow the rules and to stay on topic!');

        try {
            const threadData = await fs.readFile(CONFIG.paths.latestThread, 'utf-8');
            const previousThreadId = JSON.parse(threadData).thread;
            if (previousThreadId) {
                const previousThread = channel.threads.resolve(previousThreadId);
                if (previousThread) {
                    await previousThread.edit({
                        archived: true,
                        locked: true,
                        name: `[Closed] ${previousThread.name}`,
                    });
                }
            }
        } catch (err) {
            console.log(err);
        }

        await Promise.all([
            fs.writeFile(CONFIG.paths.latestThread, JSON.stringify({ thread: thread.id })),
            fs.writeFile(CONFIG.paths.latestVideo, JSON.stringify({ video: latest.videoId })),
        ]);
    } catch (error) {
        console.error('Error in postNewVideo:', error);
    }
}

process
    .on('unhandledRejection', (error) => {
        console.error('Unhandled promise rejection:', error);
    })
    .on('uncaughtException', (error) => {
        console.error('Uncaught exception:', error);
    });

main().catch(console.error);
