import { GuildExists } from "../../Common/GuildExists";
import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "@antibot/interactions";
export interface TagCreateOptions {
  name: string;
  title: string;
  description: string | null;
  footer: string | null;
}

export async function TagCreate(guildId: Snowflake, options: TagCreateOptions): Promise<void> {
  if (await GuildExists(guildId)) {
    await TagSchema.updateOne(
      {
        _id: guildId
      },
      {
        $push: {
          "Tags": {
            TagName: options.name,
            TagResponse: {
              TagEmbedTitle: options.title,
              TagEmbedDescription: options.description ? options.description : null,
              TagEmbedFooter: options.footer ? options.footer : null
            }
          }
        }
      }
    );
  } else {
    await new TagSchema({ _id: guildId }).save();
    await TagSchema.updateOne(
      {
        _id: guildId
      },
      {
        $push: {
          "Tags": {
            TagName: options.name,
            TagResponse: {
              TagEmbedTitle: options.title,
              TagEmbedDescription: options.description ? options.description : null,
              TagEmbedFooter: options.footer ? options.footer : null
            }
          }
        }
      }
    );
  }
}
