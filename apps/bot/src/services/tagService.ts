import { Snowflake } from '@antibot/interactions';

import { Context } from '../classes/context';
import { getGuild } from '../db';
import TagSchema, { GuildDocument } from '../models/guildSchema';
import { Nullable } from '../types';

import { CommonCondition, Service } from './service';

export type Options = {
    guildId: Snowflake;
    name: string;
};

export type Tag = {
    author?: Snowflake;
    description: Nullable<string>;
    editedBy?: Nullable<Snowflake>;
    footer: Nullable<string>;
    image_url: Nullable<string>;
    name?: string;
    title: string;
};

export type TagResponse = {
    TagAuthor: Snowflake;
    TagEditedBy: Nullable<Snowflake>;
    TagEmbedDescription: Nullable<string>;
    TagEmbedFooter: Nullable<string>;
    TagEmbedImageURL: Nullable<string>;
    TagEmbedTitle: Nullable<string>;
    TagName: string;
};

class TagService extends Service {
    private guildId: Snowflake;
    private name: string;
    private tag: Tag;

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = '';
        this.name = '';
        this.tag = {
            author: null,
            description: null,
            editedBy: null,
            footer: null,
            image_url: null,
            name: null,
            title: null,
        };
    }

    public configure<T>(config: T extends Options ? Options & { tag?: Tag } : null): this {
        this.guildId = config?.guildId ?? '';
        this.name = config?.name ?? '';
        this.tag = config?.tag ?? {
            author: null,
            description: null,
            editedBy: null,
            footer: null,
            image_url: null,
            name: null,
            title: null,
        };

        return this;
    }

    public async create<T, R>(
        create?: T extends Options ? Options & { tag?: Tag } : null,
    ): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;
        let tag = this.tag;

        if (!this.#checkConfig() && create) {
            guildId = create.guildId;
            name = create.name;
            tag = create.tag ?? {
                author: '',
                description: null,
                editedBy: null,
                footer: null,
                image_url: null,
                name: '',
                title: '',
            };
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

        guild.Tags.push({
            TagAuthor,
            TagEditedBy,
            TagName,
            TagResponse: { TagEmbedDescription, TagEmbedFooter, TagEmbedImageURL, TagEmbedTitle },
        });
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            {
                $push: {
                    Tags: {
                        TagAuthor,
                        TagEditedBy,
                        TagName,
                        TagResponse: {
                            TagEmbedDescription,
                            TagEmbedFooter,
                            TagEmbedImageURL,
                            TagEmbedTitle,
                        },
                    },
                },
                $setOnInsert: { _id: guildId },
            },
            { upsert: true },
        );

        return <CommonCondition<R>>undefined;
    }

    public async deleteValue<T, R>(
        d?: T extends Options ? Options : null,
    ): Promise<CommonCondition<R>> {
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
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne({ _id: guildId }, { $pull: { Tags: { TagName: name } } });

        return <CommonCondition<R>>true;
    }

    public async getMultiValues<T, R>(
        getMultiValues?: T extends Snowflake ? Snowflake : null,
    ): Promise<CommonCondition<R extends TagResponse[] ? TagResponse[] : null>> {
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

        return <CommonCondition<R extends TagResponse[] ? TagResponse[] : null>>tags.map((tag) => ({
            TagAuthor: tag.TagAuthor,
            TagEditedBy: tag.TagEditedBy,
            TagEmbedDescription: tag.TagResponse.TagEmbedDescription,
            TagEmbedFooter: tag.TagResponse.TagEmbedFooter,
            TagEmbedImageURL: tag.TagResponse.TagEmbedImageURL,
            TagEmbedTitle: tag.TagResponse.TagEmbedTitle,
            TagName: tag.TagName,
        }));
    }

    public async getValues<T, R>(
        get?: T extends Options ? Options : null,
    ): Promise<CommonCondition<R extends TagResponse ? TagResponse : null>> {
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

        const { TagAuthor, TagName, TagResponse } = tag;
        const { TagEmbedDescription, TagEmbedFooter, TagEmbedImageURL, TagEmbedTitle } =
            TagResponse;

        return <CommonCondition<R extends TagResponse ? TagResponse : null>>{
            TagAuthor,
            TagEditedBy: tag.TagEditedBy,
            TagEmbedDescription,
            TagEmbedFooter,
            TagEmbedImageURL,
            TagEmbedTitle,
            TagName,
        };
    }

    public async itemExists<T>(
        exists?: T extends Options ? Options : null,
    ): Promise<CommonCondition<boolean>> {
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

    public async modify<T, R>(
        mod?: T extends Options ? Options & { tag?: Tag } : null,
    ): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;
        let tag = this.tag;

        if (!this.#checkConfig() && mod) {
            guildId = mod.guildId;
            name = mod.name;
            tag = mod.tag ?? {
                author: '',
                description: null,
                editedBy: null,
                footer: null,
                image_url: null,
                name: '',
                title: null,
            };
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
            TagEmbedDescription:
                typeof tag.description === 'string'
                    ? tag.description
                    : tagInDb.TagResponse.TagEmbedDescription,
            TagEmbedFooter:
                typeof tag.footer === 'string' ? tag.footer : tagInDb.TagResponse.TagEmbedFooter,
            TagEmbedImageURL:
                typeof tag.image_url === 'string'
                    ? tag.image_url
                    : tagInDb.TagResponse.TagEmbedImageURL,
            TagEmbedTitle: tag.title || tagInDb.TagResponse.TagEmbedTitle,
        };

        const updatedTag = {
            TagAuthor: tagInDb.TagAuthor,
            TagEditedBy: tag.editedBy ?? tagInDb.TagEditedBy,
            TagName: name,
            TagResponse: updatedTagResponse,
        };

        guild.Tags[index] = updatedTag;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            {
                _id: guildId,
                'Tags.TagName': name,
            },
            {
                $set: {
                    'Tags.$.TagEditedBy': updatedTag.TagEditedBy,
                    'Tags.$.TagResponse': updatedTagResponse,
                },
            },
        );

        return <CommonCondition<R>>null;
    }

    #checkConfig(): boolean {
        return Boolean(this.guildId && this.name);
    }
}

export default TagService;
