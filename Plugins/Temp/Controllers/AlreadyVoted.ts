import type { Snowflake } from "@antibot/interactions";
import VoteSchema from "../../../Models/VoteSchema";

export async function AlreadyVoted(user: Snowflake): Promise<boolean> {
    return await VoteSchema.findOne({ _id: user }) ? true : false;
}