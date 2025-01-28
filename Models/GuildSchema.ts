import { Snowflake } from "@antibot/interactions";
import { model, Schema, Document } from "mongoose";
import { Nullable } from "../Common/types";

export interface GuildDocument extends Document {
    _id: Snowflake;
    SupportRoles: Snowflake[];
    GuildSettings: Settings;
    Tags: Tag[];
}

export type Settings = {
    Channels: {
        AllowedTagChannels: Snowflake[];
    },
    Roles: {
        AllowedTagRoles: Snowflake[];
        AllowedTagAdminRoles: Snowflake[]
        AllowedAdminRoles: Snowflake[];
    }
}

export type Tag = {
    TagName: string;
    TagAuthor: Snowflake;
    TagEditedBy: Nullable<Snowflake>;
    TagResponse: {
        TagEmbedTitle: string;
        TagEmbedDescription: Nullable<string>;
        TagEmbedImageURL: Nullable<string>;
        TagEmbedFooter: Nullable<string>;
    }
}

export default model<GuildDocument>("support-tags", new Schema(
    {
        _id: String,

        SupportRoles: { type: [String], default: [] },
        GuildSettings: {
            Channels: {
                AllowedTagChannels: { type: [], default: [] }
            },
            Roles: {
                AllowedTagRoles: { type: [], default: [] },
                AllowedTagAdminRoles: { type: [], default: [] },
                AllowedAdminRoles: { type: [], default: [] },
            }
        },
        Tags: {
            type: [
                {
                    TagName: String,
                    TagAuthor: String,
                    TagEditedBy: { type: String, default: null },
                    TagResponse: {
                        TagEmbedTitle: { type: String, default: undefined, required: true },
                        TagEmbedDescription: { type: String, default: null },
                        TagEmbedImageURL: { type: String, default: null },
                        TagEmbedFooter: { type: String, default: null }
                    }
                }
            ],
            default: []
        },
    }, { versionKey: false, timestamps: true }));