import type { Snowflake } from "@antibot/interactions";
import { Document } from "mongoose";

export interface Tag {
  TagName: string;
  TagAuthor: Snowflake;
  TagResponse: {
    TagEmbedTitle: string;
    TagEmbedDescription: string | null;
    TagEmbedFooter: string | null
  }
}

export interface TagDocument extends Document {
  _id: string;
  Tags: Tag[];
}
