import { model, Schema } from "mongoose";
import { GuildDocument } from "./GuildDocument";

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
