import numeral from 'numeral';

/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from './classes/context';

export async function getLatestYoutubeVideo(
    youtubeId: string,
    apiKey: string,
): Promise<{ channel: string; description: string; id: string; thumbnail: string; title: string; }> {
    const data = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeId}&maxResults=1&order=date&type=video&key=${apiKey}`,
    );
    const json = await data.json();
    return {
        channel: json.items[0].snippet.channelTitle,
        description: json.items[0].snippet.description,
        id: json.items[0].id.videoId,
        thumbnail: json.items[0].snippet.thumbnails.high.url,
        title: json.items[0].snippet.title,
    };
}

// Not random
export function getRandomYoutubeAPIKey(ctx: Context): string {
    return [
        ctx.env.get('youtube_key_one'),
        ctx.env.get('youtube_key_two'),
        ctx.env.get('youtube_key_three'),
    ][Math.floor(Math.random() * 3)] as string;
}

export async function getYoutubeChannel<T>(youtubeId: string, apiKey: string): Promise<T> {
    return (await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apiKey}`,
    )) as T;
}

export async function updateSubCountChannel(ctx: Context): Promise<void> {
    const data = await getYoutubeChannel<{ [key: string]: any }>(
        ctx.env.get('youtube_id'),
        getRandomYoutubeAPIKey(ctx),
    );
    const json = await data.json();
    const subscriberCount: string = String(
        numeral(json.items[0].statistics.subscriberCount).format('0.00a'),
    ).toUpperCase();
    // @ts-ignore
    const channel = ctx.channels.cache.get(ctx.env.get('sub_count_channel')) as TextChannel;
    if (channel) {
        void channel.setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
    }
}
