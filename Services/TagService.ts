import { Snowflake } from "@antibot/interactions";
import { Nullable } from "../Common/types";
import { Context } from "../Source/Context";
import { CommonCondition, Service } from "./Service";
import TagSchema, { GuildDocument } from "../Models/GuildSchema";
import { getGuild } from "../Common/db";

export type Options = {
    guildId: Snowflake;
    name: string;
};

export type Tag = {
    author?: Snowflake;
    editedBy?: Nullable<Snowflake>;
    name?: string;
    title: string;
    description: Nullable<string>;
    image_url: Nullable<string>;
    footer: Nullable<string>;
};

export type TagResponse = {
    TagAuthor: Snowflake;
    TagName: string;
    TagEditedBy: Nullable<Snowflake>;
    TagEmbedTitle: Nullable<string>;
    TagEmbedDescription: Nullable<string>;
    TagEmbedImageURL: Nullable<string>;
    TagEmbedFooter: Nullable<string>;
};

class TagService extends Service {
    private guildId: Snowflake;
    private name: string;
    private tag: Tag;

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = "";
        this.name = "";
        this.tag = { author: null, editedBy: null, name: null, title: null, description: null, image_url: null, footer: null };
    }

    #makeGuildKey(id: string): Record<'guild', string> {
        return { guild: id };
    }

    public configure<T>(config: T extends Options ? Options & { tag?: Tag } : null): ThisParameterType<this> {
        this.guildId = config?.guildId ?? "";
        this.name = config?.name ?? "";
        this.tag = config?.tag ?? { author: null, editedBy: null, name: null, title: null, description: null, image_url: null, footer: null };

        return <ThisParameterType<this>>this;
    }

    #checkConfig(): boolean {
        return this.guildId && this.name ? true : false;
    }

    public async itemExists<T>(exists?: T extends Options ? Options : null): Promise<CommonCondition<boolean>> {
        let guildId = this.guildId;
        let name = this.name;

        if (!this.#checkConfig() && exists) {
            guildId = exists.guildId;
            name = exists.name;
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tags = guild.Tags;

        if (tags.find((tag) => tag.TagName === name)) return true;

        return false;
    }

    public async getValues<T, R>(get?: T extends Options ? Options : null): Promise<CommonCondition<R extends TagResponse ? TagResponse : null>> {
        let guildId = this.guildId;
        let name = this.name;

        if (!this.#checkConfig() && get) {
            guildId = get.guildId;
            name = get.name;
        }

        if (!(await this.itemExists<Options>({ guildId, name }))) return null;

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tags = guild.Tags;

        const tag = tags.find((tag) => tag.TagName === name);

        const { TagName, TagAuthor, TagResponse } = tag;
        const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = TagResponse;

        return <CommonCondition<R extends TagResponse ? TagResponse : null>>{ TagName, TagAuthor, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter };
    }

    public async create<T, R>(create?: T extends Options ? Options & { tag?: Tag } : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;
        let tag = this.tag;

        if (!this.#checkConfig() && create) {
            guildId = create.guildId;
            name = create.name;
            tag = create.tag ?? { author: "", editedBy: null, name: "", title: "", description: null, image_url: null, footer: null };
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const TagName = name.trim();
        const TagAuthor = tag.author;
        const TagEditedBy = tag.editedBy;
        const TagEmbedTitle = tag.title;
        const TagEmbedDescription = tag.description ?? null;
        const TagEmbedImageURL = tag.image_url ?? null;
        const TagEmbedFooter = tag.footer ?? null;

        guild.Tags.push({ TagName, TagAuthor, TagEditedBy, TagResponse: { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } });
        await this.ctx.store.setForeignKey(guildId, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            {
                $setOnInsert: { _id: guildId },
                $push: {
                    Tags: {
                        TagName,
                        TagAuthor,
                        TagEditedBy,
                        TagResponse: { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter },
                    },
                },
            },
            { upsert: true }
        );

        return <CommonCondition<R>>undefined;
    }

    public async modify<T, R>(mod?: T extends Options ? Options & { tag?: Tag } : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;
        let tag = this.tag;

        if (!this.#checkConfig() && mod) {
            guildId = mod.guildId;
            name = mod.name;
            tag = mod.tag ?? { author: "", editedBy: null, name: "", title: null, description: null, image_url: null, footer: null }; // Ensure null default values
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tagInDb = guild.Tags.find((tag) => tag.TagName === name);
        const index = guild.Tags.findIndex((tag) => tag.TagName === name);

        if (tag.title.length === 0) tag.title = tagInDb.TagResponse.TagEmbedTitle;
        if (tag.editedBy.length === 0) tag.editedBy = tagInDb.TagEditedBy;
        if (tag.description.length === 0) tag.description = tagInDb.TagResponse.TagEmbedDescription;
        if (tag.image_url.length === 0) tag.image_url = tagInDb.TagResponse.TagEmbedImageURL;
        if (tag.footer.length === 0) tag.footer = tagInDb.TagResponse.TagEmbedFooter;

        const TagName = tag.name;
        const TagEditedBy = tag.editedBy;
        const TagEmbedTitle = tag.title;
        const TagEmbedDescription = tag.description;
        const TagEmbedImageURL = tag.image_url;
        const TagEmbedFooter = tag.footer;

        guild[index] = { TagName, TagEditedBy, TagResponse: { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } };

        await this.ctx.store.setForeignKey(guildId, guild);

        await TagSchema.updateOne(
            {
                _id: guildId,
                "Tags.TagName": TagName,
            },
            {
                $set: {
                    "Tags.$.TagEditedBy": TagEditedBy,
                    "Tags.$.TagResponse.TagEmbedTitle": TagEmbedTitle,
                    "Tags.$.TagResponse.TagEmbedDescription": TagEmbedDescription,
                    "Tags.$.TagResponse.TagEmbedImageURL": TagEmbedImageURL,
                    "Tags.$.TagResponse.TagEmbedFooter": TagEmbedFooter
                }
            }
        );

        return <CommonCondition<R>>null;
    }

    public async getMultiValues<T, R>(getMultiValues?: T extends Snowflake ? Snowflake : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;

        if (!this.#checkConfig() && getMultiValues) {
            guildId = getMultiValues;
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tags = guild.Tags;

        const filteredTags = [];

        if (tags.length === 0) {
            return <CommonCondition<R>>filteredTags;
        }

        for (const tag of tags) {
            const { TagAuthor, TagEditedBy, TagName, TagResponse } = tag;
            const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = TagResponse;
            filteredTags.push({ TagAuthor, TagEditedBy, TagName, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter });
        }

        return <CommonCondition<R>>filteredTags;
    }

    public async deleteValue<T, R>(d?: T extends Options ? Options : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;

        if (!this.#checkConfig() && d) {
            guildId = d.guildId;
            name = d.name;
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tag = await this.itemExists<Options>({ guildId, name });

        if (tag) {
            const index = guild.Tags.findIndex((tag) => tag.TagName === name);

            guild.Tags.slice(index, 1);
            await this.ctx.store.setForeignKey(guildId, guild);

            await TagSchema.updateOne({ _id: guildId }, { $pull: { Tags: { TagName: name } } });

            return <CommonCondition<R>>true;
        }

        return <CommonCondition<R>>false;
    }
}

export default TagService;