import type { Snowflake } from "@antibot/interactions";
import { TagExists } from "./TagExists";
import { Context } from "../../../Source/Context";

export type TagGetPromise = {
    TagAuthor: Snowflake;
    TagName: string;
    TagEmbedTitle: string | null;
    TagEmbedDescription: string | null;
    TagEmbedFooter: string | null;
};

type TagGetResponse = TagGetPromise | null;

export async function TagGet(
    name: string,
    guildId: Snowflake,
    ctx: Context
): Promise<TagGetResponse> {
    if (await TagExists(guildId, name, ctx)) {
        let tags: TagGetPromise[] = await ctx.store.getGuild({ guild: guildId });
        if (!Array.isArray(tags)) {
            tags = [];
        }
        const findTag: TagGetPromise = tags.find((tag) => tag.TagName == name);
        return findTag || null;
    } else {
        return null;
    }
}
