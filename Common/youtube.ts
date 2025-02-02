/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Context } from '../Source/Context';
import numeral from 'numeral';

export async function getYoutubeChannel<T>(youtubeId: string, apiKey: string): Promise<T> {
    return (await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${youtubeId}&key=${apiKey}`,
    )) as T;
}

export async function getLatestYoutubeVideo(
    youtubeId: string,
    apiKey: string,
): Promise<{ id: string; title: string; description: string; thumbnail: string; channel: string }> {
    const data = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeId}&maxResults=1&order=date&type=video&key=${apiKey}`,
    );
    const json = await data.json();
    return {
        id: json.items[0].id.videoId,
        title: json.items[0].snippet.title,
        description: json.items[0].snippet.description,
        thumbnail: json.items[0].snippet.thumbnails.high.url,
        channel: json.items[0].snippet.channelTitle,
    };
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
    void ctx.channels.cache
        .get(ctx.env.get('sub_count_channel'))
        .setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
}

// Not random
export function getRandomYoutubeAPIKey(ctx: Context): string {
    return [
        ctx.env.get('youtube_key_one'),
        ctx.env.get('youtube_key_two'),
        ctx.env.get('youtube_key_three'),
    ][Math.floor(Math.random() * 3)] as string;
}
