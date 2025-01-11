import GuildSchema from "../Models/GuildSchema";
import UserSchema from "../Models/UserSchema";
import { Snowflake } from "@antibot/interactions";

export async function userExists(userId: Snowflake): Promise<boolean> {
    return await UserSchema.findOne({ _id: userId }) ? true : false; 
}

export async function guildExists(guildId: Snowflake): Promise<boolean> {
    return await GuildSchema.findOne({ _id: guildId }) ? true : false;
}