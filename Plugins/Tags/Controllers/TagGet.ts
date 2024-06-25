import type { Snowflake } from "@antibot/interactions";
import { TagExists } from "./TagExists";
import { Context } from "../../../Source/Context";
import { Tag } from "../../../Models/TagDocument";

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
        let tags: Tag[] = await ctx.store.getGuild({ guild: guildId });
        if (!Array.isArray(tags)) {
            tags = [];
        }
        const findTag = tags.find((tag) => tag.TagName == name);
        return {
              TagAuthor: findTag.TagAuthor,
              TagName: findTag.TagName,
              TagEmbedTitle: findTag.TagResponse.TagEmbedTitle,
              TagEmbedDescription: findTag.TagResponse.TagEmbedDescription,
              TagEmbedFooter: findTag.TagResponse.TagEmbedFooter
            } || null;
    } else {
        return null;
    }
}
