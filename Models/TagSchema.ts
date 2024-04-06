import { Schema, model } from "mongoose";
import { TagDocument } from "./TagDocument";
import { MO } from "./MongoObject";

const TagSchema: Schema = new Schema(
  {
    _id: String,
    Tags: {
      type: [
        {
          TagName: String,
          TagResponse: {
            TagEmbedTitle: MO(String, undefined, true),
            TagEmbedDescription: MO(String, null, false),
            TagEmbedFooter: MO(String, null, false)
          }
        }
      ],
      default: []
    },
  }, { versionKey: false, timestamps: true });

export = model<TagDocument>("support-tags", TagSchema);
