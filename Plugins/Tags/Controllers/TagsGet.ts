import { Wrap } from "../../../Common/Wrap";
import TagSchema from "../../../Models/TagSchema";
import type { Snowflake } from "discord.js";
import type { Context } from "../../../Source/Context";
import type { Tag } from "../../../Models/TagDocument";

export async function TagsGet(
    guildId: Snowflake,
    ctx: Context
): Promise<Tag[]> {
    const key: Record<"guild", Snowflake> = { guild: guildId };
    let tags: Tag[] = await ctx.store.getGuild(key);
    if (!Array.isArray(tags) || tags.length === 0) {
        const wrappedGuild = await Wrap(TagSchema.findOne({ _id: guildId }));
        if (wrappedGuild.data) {
            tags = wrappedGuild.data.Tags;
            await ctx.store.setKey(key, ...tags);
        } else {
            tags = [];
        }
    }
    return tags;
}
