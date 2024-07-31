import { Snowflake } from "@antibot/interactions";
import { Context } from "../../../Source/Context";

export type commonOptions = {
    guildId: Snowflake;
    name: string;
    ctx: Context;
}

export type GuildSnowflake = Record<"guild", Snowflake>;

export type TagOptions = {
    author?: Snowflake;
    name: string;
    title: string;
    description: string | null;
    footer: string | null;
}

export type TagResponse = {
  TagAuthor: Snowflake;
  TagName: string;
  TagEmbedTitle: string | null;
  TagEmbedDescription: string | null;
  TagEmbedFooter: string | null;
}
