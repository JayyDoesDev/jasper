import type { Snowflake } from "@antibot/interactions";
import TagSchema from "../../Models/TagSchema";
import { TagExists } from "./TagExists";
import { Wrap } from "../../Common/Wrap";
import { Tag } from "../../Models/TagDocument";
import { Context } from "../../Context";

export type TagGetPromise = {
  TagAuthor: Snowflake;
  TagName: string;
  TagEmbedTitle: string | null;
  TagEmbedDescription: string | null;
  TagEmbedFooter: string | null;
};

type TagGetResponse = TagGetPromise | { Response: string };

export async function TagGet(name: string, guildId: Snowflake, ctx: Context): Promise<TagGetResponse> {
  if (await TagExists(guildId, name, ctx)) {
    let tags: TagGetPromise[]  = JSON.parse(await ctx.store.get(JSON.stringify({ guild: guildId })));
    if (!Array.isArray(tags)) {
      tags = [];
    }
    const findTag: TagGetPromise = tags.find(tag => tag.TagName == name);
    return findTag || { Response: "Not Found" };
  } else {
    return { Response: "Not Found" };
  }
}
