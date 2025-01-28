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

    public configure<T>(config: T extends Options ? Options & { tag?: Tag } : null): ThisParameterType<this> {
        this.guildId = config?.guildId ?? "";
        this.name = config?.name ?? "";
        this.tag = config?.tag ?? { author: null, editedBy: null, name: null, title: null, description: null, image_url: null, footer: null };

        return <ThisParameterType<this>>this;
    }

    #checkConfig(): boolean {
        return Boolean(this.guildId && this.name);
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

        if (!guildId || !name) {
            throw new Error('GuildId and name are required to get tag values');
        }

        if (!(await this.itemExists<Options>({ guildId, name }))) {
            return null;
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tag = guild.Tags.find((tag) => tag.TagName === name);

        if (!tag) {
            return null;
        }

        const { TagName, TagAuthor, TagResponse } = tag;
        const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = TagResponse;

        return <CommonCondition<R extends TagResponse ? TagResponse : null>>{ 
            TagName, 
            TagAuthor, 
            TagEditedBy: tag.TagEditedBy,
            TagEmbedTitle, 
            TagEmbedDescription, 
            TagEmbedImageURL, 
            TagEmbedFooter 
        };
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

        if (!guildId || !name) {
            throw new Error('GuildId and name are required to create a tag');
        }

        if (await this.itemExists<Options>({ guildId, name })) {
            throw new Error(`Tag "${name}" already exists in guild ${guildId}`);
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        if (!tag.title) {
            throw new Error('Tag title is required');
        }

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
            tag = mod.tag ?? { author: "", editedBy: null, name: "", title: null, description: null, image_url: null, footer: null };
        }

        if (!guildId || !name) {
            throw new Error('GuildId and name are required for tag modification');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tagInDb = guild.Tags.find((tag) => tag.TagName === name);

        if (!tagInDb) {
            throw new Error(`Tag "${name}" not found in guild ${guildId}`);
        }

        const index = guild.Tags.findIndex((tag) => tag.TagName === name);

        const updatedTagResponse = {
            TagEmbedTitle: tag.title || tagInDb.TagResponse.TagEmbedTitle,
            TagEmbedDescription: typeof tag.description === 'string' ? tag.description : tagInDb.TagResponse.TagEmbedDescription,
            TagEmbedImageURL: typeof tag.image_url === 'string' ? tag.image_url : tagInDb.TagResponse.TagEmbedImageURL,
            TagEmbedFooter: typeof tag.footer === 'string' ? tag.footer : tagInDb.TagResponse.TagEmbedFooter
        };

        const updatedTag = {
            TagName: name,
            TagAuthor: tagInDb.TagAuthor,
            TagEditedBy: tag.editedBy ?? tagInDb.TagEditedBy,
            TagResponse: updatedTagResponse
        };

        guild.Tags[index] = updatedTag;
        await this.ctx.store.setForeignKey(guildId, guild);

        await TagSchema.updateOne(
            {
                _id: guildId,
                "Tags.TagName": name
            },
            {
                $set: {
                    "Tags.$.TagEditedBy": updatedTag.TagEditedBy,
                    "Tags.$.TagResponse": updatedTagResponse
                }
            }
        );

        return <CommonCondition<R>>null;
    }

    public async getMultiValues<T, R>(getMultiValues?: T extends Snowflake ? Snowflake : null): Promise<CommonCondition<R extends TagResponse[] ? TagResponse[] : null>> {
        let guildId = this.guildId;

        if (!this.#checkConfig() && getMultiValues) {
            guildId = getMultiValues;
        }

        if (!guildId) {
            throw new Error('GuildId is required to get multiple tags');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tags = guild.Tags;

        if (!tags?.length) {
            return <CommonCondition<R extends TagResponse[] ? TagResponse[] : null>>[];
        }

        return <CommonCondition<R extends TagResponse[] ? TagResponse[] : null>>(
            tags.map(tag => ({
                TagAuthor: tag.TagAuthor,
                TagEditedBy: tag.TagEditedBy,
                TagName: tag.TagName,
                TagEmbedTitle: tag.TagResponse.TagEmbedTitle,
                TagEmbedDescription: tag.TagResponse.TagEmbedDescription,
                TagEmbedImageURL: tag.TagResponse.TagEmbedImageURL,
                TagEmbedFooter: tag.TagResponse.TagEmbedFooter
            }))
        );
    }

    public async deleteValue<T, R>(d?: T extends Options ? Options : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;

        if (!this.#checkConfig() && d) {
            guildId = d.guildId;
            name = d.name;
        }

        if (!guildId || !name) {
            throw new Error('GuildId and name are required for tag deletion');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const tagExists = await this.itemExists<Options>({ guildId, name });

        if (!tagExists) {
            return <CommonCondition<R>>false;
        }

        const index = guild.Tags.findIndex((tag) => tag.TagName === name);
        if (index === -1) {
            return <CommonCondition<R>>false;
        }

        guild.Tags.splice(index, 1);
        await this.ctx.store.setForeignKey(guildId, guild);

        await TagSchema.updateOne(
            { _id: guildId }, 
            { $pull: { Tags: { TagName: name } } }
        );

        return <CommonCondition<R>>true;
    }
}

export default TagService;
