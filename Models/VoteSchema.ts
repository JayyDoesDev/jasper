import { model, Schema } from "mongoose";
import { VoteDocument } from "./VoteDocument";

export default model<VoteDocument>("votes", new Schema(
    {
        _id: String,
        Candidate: String,
    }, { versionKey: false, timestamps: true })
);