import { Wrap } from "../../Common/Wrap";
import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "discord.js";
import type { Context } from "../../Source/Context";
import type { Tag } from "../../Models/TagDocument";

export async function TagsGet(
    guildId: Snowflake,
    ctx: Context
): Promise<Tag[]> {
    let tags: Tag[] = JSON.parse(
        await ctx.store.get(JSON.stringify({ guild: guildId }))
    );
    if (!Array.isArray(tags) || tags.length === 0) {
        const wrappedGuild = await Wrap(TagSchema.findOne({ _id: guildId }));
        if (wrappedGuild.data) {
            tags = wrappedGuild.data.Tags;
            await ctx.store.set(JSON.stringify({ guild: guildId }), JSON.stringify(tags));
        } else {
            tags = [];
        }
    }
    return tags;
}
