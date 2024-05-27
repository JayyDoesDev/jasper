import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "@antibot/interactions";
import { TagGetPromise } from "./TagGet";
import { Context } from "../../Source/Context";
import { TagExists } from "./TagExists";

export interface TagEditOptions {
    name: string;
    title: string;
    description: string | null;
    footer: string | null;
}

export async function TagEdit(
    guildId: Snowflake,
    options: TagEditOptions,
    ctx: Context
): Promise<void> {
    const tagExists = await TagExists(guildId, options.name, ctx);
    if (!tagExists) {
        console.log("Tag not found");
    }

    const key: string = JSON.stringify({ guild: guildId });
    let cachedTags: TagGetPromise[] = JSON.parse(await ctx.store.get(key));
    if (!Array.isArray(cachedTags)) {
        cachedTags = [];
    }

    const tagIndex: number = cachedTags.findIndex(
        (t) => t.TagName === options.name
    );
    if (tagIndex !== -1) {
        const originalTag = cachedTags[tagIndex];
        cachedTags[tagIndex] = {
            TagAuthor: originalTag.TagAuthor,
            TagName: options.name,
            TagEmbedTitle: options.title ?? originalTag.TagEmbedTitle,
            TagEmbedDescription:
                options.description ?? originalTag.TagEmbedDescription,
            TagEmbedFooter: options.footer ?? originalTag.TagEmbedFooter,
        };
    } else {
        console.log("Tag not found in cache");
    }

    await ctx.store.set(key, JSON.stringify(cachedTags));

    await TagSchema.findOneAndUpdate(
        {
            _id: guildId,
            "Tags.TagName": options.name,
        },
        {
            $set: {
                "Tags.$.TagResponse.TagEmbedTitle":
                    options.title ?? cachedTags[tagIndex].TagEmbedTitle,
                "Tags.$.TagResponse.TagEmbedDescription":
                    options.description ?? cachedTags[tagIndex].TagEmbedDescription,
                "Tags.$.TagResponse.TagEmbedFooter":
                    options.footer ?? cachedTags[tagIndex].TagEmbedFooter,
            },
        }
    );
}
