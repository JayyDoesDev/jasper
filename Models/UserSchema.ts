import { model, Schema } from "mongoose";
import { UserDocument } from "./UserDocument";

export default model<UserDocument>("support-helpers", new Schema(
    {
        _id: String,
        Incognito: {
            ShowCommands: { type: Boolean, default: false },
            ShowCommandAuthor: { type: Boolean, default: false } 
        }
  }, { versionKey: false, timestamps: true }));