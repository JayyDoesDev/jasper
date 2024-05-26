import { Context } from "../../Context";
import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "@antibot/interactions";
import { TagGetPromise } from "./TagGet";

export async function TagDelete(guildId: Snowflake, tagName: string, ctx: Context): Promise<void> {
  const key: string = JSON.stringify({ guild: guildId });
  const cachedTags: TagGetPromise[] = JSON.parse(await ctx.store.get(key));
  if (!cachedTags) {
    console.log("Tag not found in cache");
  }
  const tagIndex = cachedTags.findIndex(x => x.TagName === tagName);
  if (tagIndex === -1) {
    console.log("Tag not found in cache");
  }
  cachedTags.splice(tagIndex, 1);
  await ctx.store.set(key, JSON.stringify(cachedTags));
  await TagSchema.updateOne(
    { _id: guildId },
    { $pull: { Tags: { TagName: tagName } } }
  );
}
