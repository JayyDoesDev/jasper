import { Document } from "mongoose";

export interface Tag {
  TagName: string;
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
