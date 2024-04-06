import { GuildExists } from "../../Common/GuildExists";
import { Wrap } from "../../Common/Wrap";
import { Tag } from "../../Models/TagDocument";
import type { Snowflake } from "discord.js";
import TagSchema from "../../Models/TagSchema";
export async function TagExists(guildId: Snowflake, name: string): Promise<boolean> {
  if (await GuildExists(guildId)) {
    const wrappedGuild = await Wrap(TagSchema.findOne({ _id: guildId }));
    return wrappedGuild.data.Tags.find((t: Tag) => t.TagName === name) ? true : false;
  };
  return false;
}
