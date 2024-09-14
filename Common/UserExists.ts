import UserSchema from "../Models/UserSchema";
import type { Snowflake } from "@antibot/interactions";

export async function UserExists(userId: Snowflake): Promise<boolean> {
    return await UserSchema.findOne({ _id: userId }) ? true : false;
}