import GuildSchema from "../Models/GuildSchema";
import type { Snowflake } from "@antibot/interactions";

export async function GuildExists(guildId: Snowflake): Promise<boolean> {
  return await GuildSchema.findOne({ _id: guildId }) ? true : false;
}
