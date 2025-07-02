import { VoiceChannel } from 'discord.js';
import numeral from 'numeral';

/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from './classes/context';

export interface YoutubeChannelResponseBase {
    channelId: string;
}

export interface YoutubeChannelSubscribersResponse extends YoutubeChannelResponseBase {
    lastUpdated: string;
    subscriberCount: number;
}

export interface YoutubeResponse extends YoutubeChannelResponseBase {
    channel: {
        id: string
        statistics: {
            subscriberCount: string;
            videoCount: string;
            viewCount: string;
        }
    }
    latest_video: {
        channelId: string;
        channelTitle: string;
        description: string;
        liveBroadcastContent: string;
        publishedAt: string;
        publishTime: string;
        thumbnails: any;
        title: string;
        videoId: string;
        videoUrl: string;
    },
}

export async function getChannel<T = YoutubeResponse>(
    context: Context,
    youtubeId: string,
): Promise<null | T> {
    const data = await context.webserver.request('GET', `/youtube/${youtubeId}`);

    return data ? ({ ...data } as T) : null;
}

export async function getChannelSubscribers<T extends YoutubeChannelSubscribersResponse>(
    context: Context,
    youtubeId: string,
): Promise<null | T> {
    let data = await context.webserver.request(
        'GET',
        `/youtube/${youtubeId}/subscribers`,
    );

    if (!data || typeof data !== 'object' || !('status' in data)) {
        await context.webserver.request(
            'GET',
            `/youtube/${youtubeId}`,
        );

        data = await context.webserver.request(
            'GET',
            `/youtube/${youtubeId}/subscribers`,
        );
    }

    return data ? ({ ...data } as T) : null;
}

export async function getLatestYoutubeVideo<T = YoutubeResponse>(
    context: Context,
    youtubeId: string,
): Promise<null | T> {
    const data = await getChannel(context, youtubeId);

    if (!data || typeof data !== 'object') {
        return null;
    }

    return { ...data } as T;
}

export async function updateSubCountChannel(context: Context, youtubeId: string): Promise<void> {
    const data = await getChannelSubscribers(context, youtubeId);

    const subscriberCount: string = String(
        numeral(data.subscriberCount).format('0.00a'),
    ).toUpperCase();
    // @ts-ignore
    const channel = context.channels.cache.get(
        context.env.get('sub_count_channel'),
    ) as VoiceChannel;
    if (channel) {
        void channel.setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
    }
}
