import { Snowflake } from "@antibot/interactions";
import { Nullable } from "../Common/types";
import { Context } from "../Source/Context";
import { CommonCondition, Service } from "./Service";
import TagSchema from "../Models/GuildSchema";
import GuildSchema from "../Models/GuildSchema";
import { Tag as ExtTag } from "../Models/GuildDocument";

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
    public guildId: Snowflake;
    public name: string;
    public tag: Tag;

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = "";
        this.name = "";
        this.tag = { author: "", editedBy: null, name: "", title: "", description: null, image_url: null, footer: null };
    }

    #makeGuildKey(id: string): Record<'guild', string> {
        return { guild: id };
    }

    public configure<T>(config: T extends Options ? Options & { tag?: Tag } : null): ThisParameterType<this> {
        this.guildId = config?.guildId ?? "";
        this.name = config?.name ?? "";
        this.tag = config?.tag ?? { author: "", editedBy: null, name: "", title: "", description: null, image_url: null, footer: null };

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

        const key = this.#makeGuildKey(guildId);

        if (!(await this.ctx.store.guildExists(key))) {
            if (!(await GuildSchema.findOne({ _id: guildId }))) return false;
            this.ctx.store.setKey(key);
        }

        let tags = await this.ctx.store.getGuild<TagResponse[]>(key);

        if (!Array.isArray(tags)) {
            tags = [];
            this.ctx.store.setKey(key, ...tags);
        }

        if (tags.find((tag) => tag.TagName === name)) return true;

        try {
            const guild = await TagSchema.findOne({ _id: guildId });

            if (guild) {
                const tag = guild.Tags.find((tag) => tag.TagName === name);
                if (!tag) return false;

                const { TagName, TagAuthor, TagEditedBy, TagResponse } = tag;
                const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = TagResponse;

                tags.push({ TagName, TagAuthor, TagEditedBy, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter });
                this.ctx.store.setKey(key, ...tags);
                return true;
            }
        } catch (error) {
            console.error("Error fetching tags from the database:", error);
            return false;
        }

        return false;
    }

    public async getValues<T, R>(get?: T extends Options ? Options : null): Promise<CommonCondition<R extends TagResponse ? TagResponse : null>> {
        let guildId = this.guildId;
        let name = this.name;

        if (!this.#checkConfig() && get) {
            guildId = get.guildId;
            name = get.name;
        }

        const key = this.#makeGuildKey(guildId);

        if (!(await this.ctx.services.tags.itemExists<Options>({ guildId, name }))) return null;

        let tags = await this.ctx.store.getGuild<TagResponse[]>(key);

        if (!Array.isArray(tags)) tags = [];

        const tag = tags.find((tag) => tag.TagName === name);
        if (!tag) return null;

        const { TagName, TagAuthor, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = tag;

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

        const key = this.#makeGuildKey(guildId);

        if (!(await this.ctx.store.guildExists(key))) this.ctx.store.setKey(key);

        const cache = await this.ctx.store.getGuild<TagResponse[]>(key);

        const TagName = name.trim();
        const TagAuthor = tag.author;
        const TagEditedBy = tag.editedBy;
        const TagEmbedTitle = tag.title;
        const TagEmbedDescription = tag.description ?? null;
        const TagEmbedImageURL = tag.image_url ?? null;
        const TagEmbedFooter = tag.footer ?? null;

        cache.push({ TagName, TagAuthor, TagEditedBy, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter });
        
        this.ctx.store.setKey(key, ...cache);
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
            tag = mod.tag ?? { author: "", editedBy: null, name: "", title: "", description: null, image_url: null, footer: null };
        }

        const key = this.#makeGuildKey(guildId);

        if (!(await this.ctx.services.tags.itemExists<Options>({ guildId, name }))) console.log("Tag not found");

        let tags = await this.ctx.store.getGuild<TagResponse[]>(key);

        if (!Array.isArray(tags)) tags = [];

        const index = tags.findIndex((tag) => tag.TagName === name);

        const TagName = tag.name;
        const TagEditedBy = tag.editedBy;
        const TagEmbedTitle = tag.title ?? tags[index].TagEmbedTitle;
        const TagEmbedDescription = tag.description ?? tags[index].TagEmbedDescription;
        const TagEmbedImageURL = tag.image_url ?? tags[index].TagEmbedImageURL;
        const TagEmbedFooter = tag.footer ?? tags[index].TagEmbedFooter;

        if (index !== -1) {
            const { TagAuthor } = tags[index];

            tags[index] = { TagName, TagAuthor, TagEditedBy, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter };
        } else {
            console.log("Tag not found in cache");
        }

        this.ctx.store.setKey(key, ...tags);

        await TagSchema.findOneAndUpdate(
            { _id: guildId, "Tags.TagName": TagName },
            {
                $set: {
                    "Tags.$.TagEditedBy": TagEditedBy,
                    "Tags.$.TagResponse.TagEmbedTitle": TagEmbedTitle,
                    "Tags.$.TagResponse.TagEmbedDescription": TagEmbedDescription,
                    "Tags.$.TagResponse.TagEmbedImageURL": TagEmbedImageURL,
                    "Tags.$.TagResponse.TagEmbedFooter": TagEmbedFooter
                }
            }
        )

        return <CommonCondition<R>>null;
    }

    public async getMultiValues<T, R>(getMultiValues?: T extends Snowflake ? Snowflake : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;

        if (!this.#checkConfig() && getMultiValues) {
            guildId = getMultiValues;
        }

        const key = this.#makeGuildKey(guildId);

        let tags = await this.ctx.store.getGuild<ExtTag[]>(key);

        if (!Array.isArray(tags) || tags.length === 0) {
            const guild = await TagSchema.findOne({ _id: guildId });

            if (guild) {
                tags = guild.Tags;

                const filteredTags = [];

                for (const tag of tags) {
                    const { TagAuthor, TagEditedBy, TagName, TagResponse } = tag;
                    const { TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter } = TagResponse;
                    filteredTags.push({ TagAuthor, TagEditedBy, TagName, TagEmbedTitle, TagEmbedDescription, TagEmbedImageURL, TagEmbedFooter });
                }
            } else {
                tags = [];
            }
        }
        return <CommonCondition<R>>tags;
    }

    public async delete<T, R>(d?: T extends Options ? Options : null): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let name = this.name;

        if (!this.#checkConfig() && d) {
            guildId = d.guildId;
            name = d.name;
        }

        const key = this.#makeGuildKey(guildId);

        const tag = await this.itemExists<Options>({ guildId, name });

        if (tag) {
            const tags = await this.ctx.store.getGuild<TagResponse[]>(key);
            const index = tags.findIndex((tag) => tag.TagName === name);

            tags.splice(index, 1);
            this.ctx.store.setKey(key, ...tags);

            await TagSchema.updateOne({ _id: guildId }, { $pull: { Tags: { TagName: name } } } );

            return <CommonCondition<R>>true;
        } 
        
        return <CommonCondition<R>>false;
    }
}

export default TagService;