import { Snowflake } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { Nullable } from "../../../Common/Nullable";

export type commonOptions = {
    guildId: Snowflake;
    name: string;
    ctx: Context;
}

export type GuildSnowflake = Record<"guild", Snowflake>;

export type UserSnowflake = Record<"user", Snowflake>;

export type TagOptions = {
    author?: Snowflake;
    name: string;
    title: string;
    description: Nullable<string>;
    footer: Nullable<string>;
}

export type TagResponse = {
  TagAuthor: Snowflake;
  TagName: string;
  TagEmbedTitle: Nullable<string>;
  TagEmbedDescription: Nullable<string>;
  TagEmbedFooter: Nullable<string>;
}
