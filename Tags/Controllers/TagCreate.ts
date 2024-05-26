import { GuildExists } from "../../Common/GuildExists";
import { Context } from "../../Context";
import TagSchema from "../../Models/TagSchema";
import type { Snowflake } from "@antibot/interactions";
import { TagGetPromise } from "./TagGet";
export interface TagCreateOptions {
  author: Snowflake;
  name: string;
  title: string;
  description: string | null;
  footer: string | null;
}

export async function TagCreate(guildId: Snowflake, options: TagCreateOptions, ctx: Context): Promise<void> {
  const key: string = JSON.stringify({ guild: guildId });
  const exists: number = await ctx.store.exists(key);
  if (exists) {
    const cachedTags: TagGetPromise[] = JSON.parse(await ctx.store.get(key));
    cachedTags.push({
      TagName: options.name.trim(),
      TagAuthor: options.author,
      TagEmbedTitle: options.title,
      TagEmbedDescription: options.description,
      TagEmbedFooter: options.footer
    });
  } else {
    await ctx.store.set(key, JSON.stringify([]));
    const cachedTags: TagGetPromise[] = JSON.parse(await ctx.store.get(key));
    cachedTags.push({
      TagName: options.name.trim(),
      TagAuthor: options.author,
      TagEmbedTitle: options.title,
      TagEmbedDescription: options.description,
      TagEmbedFooter: options.footer
    });
  }
  if (await GuildExists(guildId)) {
    await TagSchema.updateOne(
      {
        _id: guildId
      },
      {
        $push: {
          "Tags": {
            TagName: options.name.trim(),
            TagAuthor: options.author,
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
            TagName: options.name.trim(),
            TagAuthor: options.author,
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
