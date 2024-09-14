import { model, Schema } from "mongoose";
import { GuildDocument } from "./GuildDocument";
import { MO } from "./MongoObject";

export default model<GuildDocument>("support-tags", new Schema(
  {
      _id: String,
      SupportRoles: { type: [String], default: [] },
      Tags: {
          type: [
              {
                  TagName: String,
                  TagAuthor: String,
                  TagResponse: {
                      TagEmbedTitle: MO(String, undefined, true),
                      TagEmbedDescription: MO(String, null, false),
                      TagEmbedFooter: MO(String, null, false)
                  }
              }
          ],
          default: []
      },
  }, { versionKey: false, timestamps: true }));
