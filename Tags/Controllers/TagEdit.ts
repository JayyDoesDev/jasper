import { GuildExists } from "../../Common/GuildExists";
import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "@antibot/interactions";
export interface TagEditOptions {
  name: string;
  title: string;
  description: string | null;
  footer: string | null;
}
export async function TagEdit(guildId: Snowflake, options: TagEditOptions): Promise<void> {
  const tag = await TagSchema.findOne({ _id: guildId, "Tags.TagName": options.name });
   await TagSchema.findOneAndUpdate(
    {
      _id: guildId,
      "Tags.TagName": options.name
    },
    {
      $set: {
        "Tags.$.TagResponse.TagEmbedTitle": options.title ? options.title : tag.Tags[tag.Tags.map((x) => x.TagName).indexOf(options.name)].TagResponse.TagEmbedTitle,
        "Tags.$.TagResponse.TagEmbedDescription": options.description ? options.description : tag.Tags[tag.Tags.map((x) => x.TagName).indexOf(options.name)].TagResponse.TagEmbedDescription,
        "Tags.$.TagResponse.TagEmbedFooter": options.footer ? options.footer : tag.Tags[tag.Tags.map((x) => x.TagName).indexOf(options.name)].TagResponse.TagEmbedFooter
      }
    }
  )
  console.log(await TagSchema.findOne({ _id: guildId, "Tags.TagName": options.name }))
}
