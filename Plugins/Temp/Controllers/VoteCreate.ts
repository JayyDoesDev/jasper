import type { Snowflake } from "@antibot/interactions";
import VoteSchema from "../../../Models/VoteSchema";

export async function VoteCreate(user: Snowflake, candidate: string): Promise<void> {
    await new VoteSchema({ _id: user, Candidate: candidate }).save()
}