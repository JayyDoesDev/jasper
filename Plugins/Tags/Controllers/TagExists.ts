import { GuildExists } from "../../../Common/GuildExists";
import { Wrap } from "../../../Common/Wrap";
import { Tag } from "../../../Models/TagDocument";
import type { Snowflake } from "discord.js";
import TagSchema from "../../../Models/TagSchema";
import { Context } from "../../../Source/Context";
import { TagGetPromise } from "./TagGet";

export async function TagExists(
    guildId: Snowflake,
    name: string,
    ctx: Context
): Promise<boolean> {
    const key: Record<"guild", Snowflake> = { guild: guildId };
    const exists: number = await ctx.store.guildExists(key);
    if (!exists) {
        if (!(await GuildExists(guildId))) {
            return false;
        }
        ctx.store.setKey(key);
    }

    let tags: TagGetPromise[] = await ctx.store.getGuild(key);
    if (!Array.isArray(tags)) {
        tags = [];
        ctx.store.setKey(key, ...tags);
    }

    if (tags.find((tag) => tag.TagName === name)) {
        return true;
    }
    try {
        const wrappedGuild = await Wrap(TagSchema.findOne({ _id: guildId }));
        if (!wrappedGuild.data) {
            return false;
        }
        const findTag: Tag = wrappedGuild.data.Tags.find(
            (tag: Tag) => tag.TagName === name
        );
        if (findTag) {
            tags.push({
                TagAuthor: findTag.TagAuthor,
                TagName: findTag.TagName,
                TagEmbedTitle: findTag.TagResponse.TagEmbedTitle,
                TagEmbedDescription: findTag.TagResponse.TagEmbedDescription,
                TagEmbedFooter: findTag.TagResponse.TagEmbedFooter,
            });
            ctx.store.setKey(key, ...tags);
            return true;
        }
    } catch (error) {
        console.log("Error fetching tags from the database:", error);
        return false;
    }

    return false;
}
