import { Message, TextChannel } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { Options } from '../services/settingsService';

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

        if (message.guild) {
            await this.ctx.services.settings.configure<Options>({ guildId: message.guild.id });
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
}
