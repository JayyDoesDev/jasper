import { Context } from '../../Source/Context';
import { Message, TextChannel } from 'discord.js';
import { definePlugin, Plugin } from '../../Common/define';
import { Options } from '../../Services/SettingsService';

interface ChannelState {
    active: boolean;
    messageCount: number;
    messageWindowStart: number;
    lastSlowmodeChange: number;
}

const channelStates = new Map<string, ChannelState>();

const getChannelState = (channelId: string): ChannelState => {
    if (!channelStates.has(channelId)) {
        channelStates.set(channelId, {
            active: false,
            messageCount: 0,
            messageWindowStart: Date.now(),
            lastSlowmodeChange: 0,
        });
    }
    return channelStates.get(channelId)!;
};

export = definePlugin({
    name: 'slowmode',
    description: 'Automatically change slowmode based on chat activity!',
    events: [
        {
            event: {
                name: 'messageCreate',
                once: false,
            },
            on: async (message: Message, ctx: Context) => {
                if (ctx.env.get('slowmode') == '0') return;
                if (message.author.bot) return;
                await ctx.services.settings.configure<Options>({ guildId: message.guild!.id });
                const { Channels } = ctx.services.settings.getSettings();
                const slowmodeChannels = Channels.AutomaticSlowmodeChannels;

                if (!slowmodeChannels.includes(message.channel.id)) return;

                //@ts-ignore
                const channel: TextChannel = ctx.channels.resolve(message.channel.id);
                const state = getChannelState(message.channel.id);

                if (
                    Date.now() - state.messageWindowStart >
                    ctx.env.get<string, number>('slowmode_msg_time') * 1000
                ) {
                    state.messageCount = 1;
                    state.messageWindowStart = Date.now();
                } else {
                    state.messageCount += 1;
                }

                if (state.messageCount >= ctx.env.get<string, number>('slowmode_msg_threshold')) {
                    const multiplier: number = Math.max(Math.floor(state.messageCount / 3.5), 2);

                    const currentTime = Date.now();
                    if (
                        currentTime - state.lastSlowmodeChange >
                        ctx.env.get<string, number>('slowmode_cooldown') * 1000
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
                                <number>ctx.env.get('slowmode_reset_time') * 1000,
                            );
                        }
                    }
                }
            },
        },
    ],
    public_plugin: true,
    commands: [],
}) satisfies Plugin;
