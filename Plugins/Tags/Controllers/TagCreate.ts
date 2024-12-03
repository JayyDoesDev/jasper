import TagSchema from "../../../Models/GuildSchema";
import { GuildSnowflake, TagResponse, TagCreateOptions } from "./Types";

export async function TagCreate(tagCreateOptions: TagCreateOptions): Promise<void> {
    const { guildId, options, ctx }: TagCreateOptions = tagCreateOptions;
    const key: GuildSnowflake = { guild: guildId };

    if (!(await ctx.store.guildExists(key))) {
        ctx.store.setKey(key);
    }

    const cachedTags: TagResponse[] = await ctx.store.getGuild(key);
    cachedTags.push({
        TagName: options.name.trim(),
        TagAuthor: options.author,
        TagEditedBy: options.editedBy,
        TagEmbedTitle: options.title,
        TagEmbedDescription: options.description,
        TagEmbedImageURL: options.image_url,
        TagEmbedFooter: options.footer,
    });

    await TagSchema.updateOne(
        { _id: guildId },
        {
            $setOnInsert: { _id: guildId },
            $push: {
                Tags: {
                    TagName: options.name.trim(),
                    TagAuthor: options.author,
                    TagEditedBy: options.editedBy,
                    TagResponse: {
                        TagEmbedTitle: options.title,
                        TagEmbedDescription: options.description || null,
                        TagEmbedImageURL: options.image_url || null,
                        TagEmbedFooter: options.footer || null,
                    },
                },
            },
        },
        { upsert: true }
    );
}