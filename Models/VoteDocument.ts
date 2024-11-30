import type { Snowflake } from "@antibot/interactions";
import { Document } from "mongoose";

export interface VoteDocument extends Document {
    _id: Snowflake;
    Candidate: Snowflake;
}