import { GuildExists } from "../../Common/GuildExists";
import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "@antibot/interactions";
export async function TagDelete(guildId: Snowflake, tagName: string): Promise<void> {
  await TagSchema.updateOne(
    {
      _id: guildId
    },
    {
      $pull: {
        "Tags": { TagName: tagName }
      }
    }
  );
}
