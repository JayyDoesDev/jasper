import { model, Schema } from "mongoose";
import { TagDocument } from "./TagDocument";
import { MO } from "./MongoObject";

export default model<TagDocument>("support-tags", new Schema(
  {
      _id: String,
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
