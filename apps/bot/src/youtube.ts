import numeral from 'numeral';

/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from './classes/context';

export interface YoutubeChannelResponseBase {
    channelId: string;
}

export interface YoutubeChannelResponse extends YoutubeChannelResponseBase {
    videos: YoutubeResponse[];
}

export interface YoutubeChannelSubscribersResponse extends YoutubeChannelResponseBase {
    lastUpdated: string;
    subscriberCount: number;
}

export interface YoutubeResponse extends YoutubeChannelResponseBase {
    commentCount: number;
    description: string;
    dislikeCount: number;
    duration: number;
    likeCount: number;
    publishedAt: string;
    thumbnailUrl: string;
    title: string;
    videoUrl: string;
    viewCount: number;
}

export async function getChannel<T = YoutubeChannelResponse>(
    context: Context,
    youtubeId: string,
): Promise<null | T> {
    let data = await context.webserver.request('GET', `/web/youtube/channel/${youtubeId}`);

    if (!data || typeof data !== 'object' || !('status' in data)) {
        await context.webserver.request('POST', `/web/youtube/channel`, { channelId: youtubeId });
        data = await context.webserver.request('GET', `/web/youtube/channel/${youtubeId}`);
    }

    return data ? ({ ...data } as T) : null;
}

export async function getChannelSubscribers<T extends YoutubeChannelSubscribersResponse>(
    context: Context,
    youtubeId: string,
): Promise<null | T> {
    let data = await context.webserver.request(
        'GET',
        `/web/youtube/channel/${youtubeId}/subscribers`,
    );

    if (!data || typeof data !== 'object' || !('status' in data)) {
        await context.webserver.request('POST', `/web/youtube/channel`, { channelId: youtubeId });

        data = await context.webserver.request(
            'GET',
            `/web/youtube/channel/${youtubeId}/subscribers`,
        );
    }

    return data ? ({ ...data } as T) : null;
}

export async function getLatestYoutubeVideo<T = YoutubeResponse>(
    context: Context,
    youtubeId: string,
): Promise<null | T> {
    const data = await getChannel(context, youtubeId);

    if (!data || typeof data !== 'object' || !('status' in data) || data.videos.length === 0) {
        return null;
    }

    return { ...data.videos[0] } as T;
}

export async function updateSubCountChannel(context: Context, youtubeId: string): Promise<void> {
    const data = await getChannelSubscribers(context, youtubeId);

    const subscriberCount: string = String(
        numeral(data.subscriberCount).format('0.00a'),
    ).toUpperCase();
    // @ts-ignore
    const channel = ctx.channels.cache.get(ctx.env.get('sub_count_channel')) as TextChannel;
    if (channel) {
        void channel.setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
    }
}
