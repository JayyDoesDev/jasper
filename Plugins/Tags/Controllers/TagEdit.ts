import TagSchema from "../../../Models/TagSchema";
import { TagExists } from "./TagExists";
import { commonOptions, GuildSnowflake, TagOptions, TagResponse } from "./Types";
import { Combine } from "../../../Common/Combine";

export async function TagEdit(tagEditOptions: Combine<[Omit<commonOptions, "name">, Record<"options", TagOptions>]>): Promise<void> {
    const { guildId, options, ctx }: Combine<[Omit<commonOptions, "name">, Record<"options", TagOptions>]> = tagEditOptions;
    const tagExists = await TagExists({ guildId: guildId, name: options.name, ctx: ctx });
    if (!tagExists) {
        console.log("Tag not found");
    }

    const key: GuildSnowflake = { guild: guildId };
    let cachedTags: TagResponse[] = await ctx.store.getGuild(key);
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

    ctx.store.setKey(key, ...cachedTags);

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
