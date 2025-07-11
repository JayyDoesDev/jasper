import { Message, TextChannel } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { InactiveThread, Options as InactiveThreadOptions } from '../services/inactiveThreadsService';
import { Options as SettingsOptions } from '../services/settingsService';

import { Listener } from './listener';

interface ChannelState {
    active: boolean;
    lastSlowmodeChange: number;
    messageCount: number;
    messageWindowStart: number;
}

const channelStates = new Map<string, ChannelState>();

const getChannelState = (channelId: string): ChannelState => {
    if (!channelStates.has(channelId)) {
        channelStates.set(channelId, {
            active: false,
            lastSlowmodeChange: 0,
            messageCount: 0,
            messageWindowStart: Date.now(),
        });
    }
    return channelStates.get(channelId)!;
};

export default class MessageCreateListener extends Listener<'messageCreate'> {
    constructor(ctx: Context) {
        super(ctx, 'messageCreate');
    }

    public async execute(message: Message): Promise<void> {
        if (message.author.bot) return;

        await this.handleThreadTracking(message);

        if (message.guild) {
            await this.ctx.services.settings.configure<SettingsOptions>({ guildId: message.guild.id });
            const { Channels } = this.ctx.services.settings.getSettings();

            if (Channels.AutomaticSlowmodeChannels?.includes(message.channel.id)) {
                if (this.ctx.env.get('slowmode') == '0') return;

                const channel = this.ctx.channels.resolve(message.channel.id) as TextChannel;
                const state = getChannelState(message.channel.id);

                if (
                    Date.now() - state.messageWindowStart >
                    this.ctx.env.get<string, number>('slowmode_msg_time') * 1000
                ) {
                    state.messageCount = 1;
                    state.messageWindowStart = Date.now();
                } else {
                    state.messageCount += 1;
                }

                if (
                    state.messageCount >= this.ctx.env.get<string, number>('slowmode_msg_threshold')
                ) {
                    const multiplier: number = Math.max(Math.floor(state.messageCount / 3.5), 3);

                    const currentTime = Date.now();
                    if (
                        currentTime - state.lastSlowmodeChange >
                        this.ctx.env.get<string, number>('slowmode_cooldown') * 1000
                    ) {
                        state.lastSlowmodeChange = currentTime;
                        await channel.setRateLimitPerUser(multiplier).catch(() => {
                            return;
                        });

                        if (!state.active) {
                            state.active = true;

                            setTimeout(
                                () => {
                                    state.active = false;
                                },
                                <number>this.ctx.env.get('slowmode_reset_time') * 1000,
                            );
                        }
                    }
                }
            }
        }
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: (message: Message) => this.execute(message),
        });
    }

    private async handleThreadTracking(message: Message): Promise<void> {
        try {
            if (!message.guild) return console.warn("[WARN] Message is not in a guild, skipping thread tracking.");

            if (!message.channel || !message.channel.isThread()) return console.warn("[WARN] Message is not in a thread, skipping thread tracking.");


            await this.ctx.services.settings.configure<InactiveThreadOptions>({
                guildId: message.guild.id,
            });
            const { Channels } = this.ctx.services.settings.getSettings();
            const allowedTagChannels = Channels?.AllowedTagChannels;

            if (!allowedTagChannels.includes(message.channel.parentId)) return console.warn(`[WARN] Thread parent channel ${message.channel.parentId} is not in allowed tag channels, skipping thread tracking.`);
            const guildId = message.guild.id;
            const threadId = message.channel.id;
            const authorId = message.author.id;
            const messageId = message.id;
            const timestamp = Date.now().toString();

            const existingThread = await this.ctx.services.inactiveThreads.getValues<InactiveThreadOptions, InactiveThread | null>({
                guildId,
                threadId,
            });

            if (existingThread) {
                const updateData: Partial<InactiveThread> = {
                    authorId,
                    lastMessageId: messageId,
                    lastMessageTimestamp: timestamp,
                };

                if (authorId === message.channel.ownerId && existingThread.warnTimestamp) {
                    updateData.warnMessageId = undefined;
                    updateData.warnTimestamp = undefined;
                }

                await this.ctx.services.inactiveThreads.modify<InactiveThreadOptions & { inactiveThread?: Partial<InactiveThread> }, InactiveThread | null>({
                    guildId,
                    inactiveThread: updateData,
                    threadId,
                });
            } else {
                const newThread: InactiveThread = {
                    authorId,
                    lastMessageId: messageId,
                    lastMessageTimestamp: timestamp,
                    threadId,
                };

                await this.ctx.services.inactiveThreads.create<InactiveThreadOptions & { inactiveThread?: InactiveThread }, InactiveThread>({
                    guildId,
                    inactiveThread: newThread,
                    threadId,
                });
            }

        } catch (error) {
            console.error(`[Error] Failed to handle thread tracking for thread ${message.channel.id}:`, error);
        }
    }
}
