import type { Snowflake } from "@antibot/interactions";
import TagSchema from "../../Models/TagSchema";
import { TagExists } from "./TagExists";
import { Wrap } from "../../Common/Wrap";
import { Tag } from "../../Models/TagDocument";
export async function TagGet(name: string, guildId: Snowflake): Promise<{
  TagName: string,
  TagEmbedTitle: string,
  TagEmbedDescription: string | null,
  TagEmbedFooter: string | null
}>;
export async function TagGet(name: string, guildId: Snowflake): Promise<{ Response: string }>;
export async function TagGet<T>(name: string, guildId: Snowflake): Promise<T> {
  if (await TagExists(guildId, name)) {
    const wrappedGuild = await Wrap(TagSchema.findOne({ _id: guildId }));
    const findTag = wrappedGuild.data.Tags.find((t: Tag) => {
      return t.TagName === name;
    });
    if (findTag) {
      return {
        TagName: findTag.TagName,
        TagEmbedTitle: findTag.TagResponse.TagEmbedTitle,
        TagEmbedDescription: findTag.TagResponse.TagEmbedDescription,
        TagEmbedFooter: findTag.TagResponse.TagEmbedFooter
      } as T
    } else {
      return {
        Response: "Not Found"
      } as T;
    }
  } else {
    return {
      Response: "Not Found"
    } as T;
  }
}
