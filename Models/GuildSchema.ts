import { Snowflake } from '@antibot/interactions';
import { model, Schema, Document } from 'mongoose';
import { Nullable } from '../Common/types';

export interface GuildDocument extends Document {
    _id: Snowflake;
    GuildSettings: Settings;
    Tags: Tag[];
}

export type Settings = {
    Channels: {
        AllowedTagChannels: Snowflake[];
        AutomaticSlowmodeChannels: Snowflake[];
    };
    Roles: {
        SupportRoles: Snowflake[];
        AllowedTagRoles: Snowflake[];
        AllowedTagAdminRoles: Snowflake[];
        AllowedAdminRoles: Snowflake[];
        AllowedStaffRoles: Snowflake[];
    };
    Text: {
        Topics: string[];
    };
};

export type Tag = {
    TagName: string;
    TagAuthor: Snowflake;
    TagEditedBy: Nullable<Snowflake>;
    TagResponse: {
        TagEmbedTitle: string;
        TagEmbedDescription: Nullable<string>;
        TagEmbedImageURL: Nullable<string>;
        TagEmbedFooter: Nullable<string>;
    };
};

export default model<GuildDocument>(
    'support-tags',
    new Schema(
        {
            _id: String,
            GuildSettings: {
                Channels: {
                    AllowedTagChannels: { type: [], default: [] },
                    AutomaticSlowmodeChannels: { type: [], default: [] },
                },
                Roles: {
                    SupportRoles: { type: [], default: [] },
                    AllowedTagRoles: { type: [], default: [] },
                    AllowedTagAdminRoles: { type: [], default: [] },
                    AllowedAdminRoles: { type: [], default: [] },
                    AllowedStaffRoles: { type: [], default: [] },
                },
                Text: {
                    Topics: { type: [], default: [] },
                },
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
                            TagEmbedFooter: { type: String, default: null },
                        },
                    },
                ],
                default: [],
            },
        },
        { versionKey: false, timestamps: true },
    ),
);
