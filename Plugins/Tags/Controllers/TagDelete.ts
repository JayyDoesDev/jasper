import TagSchema from "../../../Models/GuildSchema";
import { commonOptions, GuildSnowflake, TagResponse } from "./Types";

export async function TagDelete(options: commonOptions): Promise<void> {
    const { guildId, name, ctx } = options;
    const key: GuildSnowflake = { guild: guildId };
    const cachedTags: TagResponse[] = await ctx.store.getGuild(key);
    
    if (!cachedTags) {
        console.log("Tag not found in cache");
    }
    const tagIndex = cachedTags.findIndex((x) => x.TagName === name);
    
    if (tagIndex === -1) {
        console.log("Tag not found in cache");
    }
    
    cachedTags.splice(tagIndex, 1);
    ctx.store.setKey(key, ...cachedTags)
    await TagSchema.updateOne(
        { _id: guildId },
        { $pull: { Tags: { TagName: name } } }
    );
}