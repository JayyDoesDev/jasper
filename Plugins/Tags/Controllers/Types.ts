import { Snowflake } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { Nullable } from "../../../Common/Nullable";
import { Combine } from "../../../Common/Combine";

export type commonOptions = {
    guildId: Snowflake;
    name: string;
    ctx: Context;
}

export type GuildSnowflake = Record<"guild", Snowflake>;

export type UserSnowflake = Record<"user", Snowflake>;

export type TagOptions = {
    author?: Snowflake;
    editedBy?: Nullable<Snowflake>;
    name: string;
    title: string;
    description: Nullable<string>;
    image_url : Nullable<string>;
    footer: Nullable<string>;
}

export type TagResponse = {
  TagAuthor: Snowflake;
  TagName: string;
  TagEditedBy: Nullable<Snowflake>;
  TagEmbedTitle: Nullable<string>;
  TagEmbedDescription: Nullable<string>;
  TagEmbedImageURL: Nullable<string>;
  TagEmbedFooter: Nullable<string>;
}

export type TagCreateOptions = Combine<[Omit<commonOptions, "name">, Record<"options", TagOptions>]>;
