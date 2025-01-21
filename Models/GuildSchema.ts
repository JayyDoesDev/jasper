import { Snowflake } from "@antibot/interactions";
import { model, Schema, Document } from "mongoose";
import { Nullable } from "../Common/types";

export interface GuildDocument extends Document {
    _id: Snowflake;
    SupportRoles: Snowflake[];
    Tags: Tag[];
}

export type Tag = {
    TagName: string;
    TagAuthor: Snowflake;
    TagEditedBy: Nullable<Snowflake>;
    TagResponse: {
        TagEmbedTitle: string;
        TagEmbedDescription: Nullable<string>;
        TagEmbedImageURL: Nullable<string>;
        TagEmbedFooter: Nullable<string>;
    }
}

export default model<GuildDocument>("support-tags", new Schema(
  {
      _id: String,
      SupportRoles: { type: [String], default: [] },
      Tags: {
          type: [
              {
                  TagName: String,
                  TagAuthor: String,
                  TagEditedBy: { type: String, default: null },
                  TagResponse: {
                      TagEmbedTitle: { type: String, default: undefined, required: true },
                      TagEmbedDescription: { type: String, default: null },
                      TagEmbedImageURL: { type: String, default: null },
                      TagEmbedFooter: { type: String, default: null }
                  }
              }
          ],
          default: []
      },
  }, { versionKey: false, timestamps: true }));