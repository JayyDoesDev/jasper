import fs from 'fs/promises';
import path from 'path';

import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags, TextChannel } from 'discord.js';

import { defineSubCommand } from '../../../Common/define';
import { getLatestYoutubeVideo, getRandomYoutubeAPIKey } from '../../../Common/youtube';
import { Context } from '../../../Source/Context';

const paths = {
    latestThread: path.join(process.cwd(), 'latestthread.json'),
    latestVideo: path.join(process.cwd(), 'latestvideo.json'),
};

export const NotifyVideoDiscussionsSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        try {
            const latest = await getLatestYoutubeVideo(
                ctx.env.get('youtube_id'),
                getRandomYoutubeAPIKey(ctx),
            );

            const channel = ctx.channels.resolve(
                ctx.env.get('youtube_post_channel'),
            ) as TextChannel;
            if (!channel) {
                await interaction.reply({
                    content: 'Could not find the video discussions channel.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            let currentVideoId: string | undefined;
            try {
                const data = await fs.readFile(paths.latestVideo, 'utf-8');
                currentVideoId = JSON.parse(data).video;
            } catch {
                await fs.writeFile(paths.latestVideo, JSON.stringify({ video: '' }));
            }

            if (currentVideoId === latest.id) {
                await interaction.reply({
                    content: 'It looks like the most recent video has already been posted.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const messages = await channel.messages.fetch({ limit: 100 });
            if (messages.some((message) => message.content.includes(latest.id))) {
                await interaction.reply({
                    content: 'Latest video already posted.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const message = await channel.send({
                allowedMentions: { roles: [ctx.env.get('youtube_video_discussions_role')] },
                content: `<@&${ctx.env.get('youtube_video_discussions_role')}>\n# ${latest.title}\n${latest.description}\nhttps://www.youtube.com/watch?v=${latest.id}`,
            });

            const thread = await message.startThread({
                autoArchiveDuration: 1440,
                name: latest.title,
            });

            await thread.send('# Reminder to follow the rules and to stay on topic!');

            try {
                const threadData = await fs.readFile(paths.latestThread, 'utf-8');
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
            } catch {
                await fs.writeFile(paths.latestThread, JSON.stringify({ thread: '' }));
            }

            await Promise.all([
                fs.writeFile(paths.latestThread, JSON.stringify({ thread: thread.id })),
                fs.writeFile(paths.latestVideo, JSON.stringify({ video: latest.id })),
            ]);

            await interaction.reply({
                content: 'Latest video now posted.',
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Error in notify_video_discussions command:', error);
            await interaction.reply({
                content: 'An error occurred while processing the command.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
    name: 'notify_video_discussions',
});

export const commandOptions = {
    description: 'Notify about video discussions!',
    name: NotifyVideoDiscussionsSubCommand.name,
    options: [],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
