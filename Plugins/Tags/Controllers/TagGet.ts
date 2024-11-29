import { TagExists } from "./TagExists";
import { commonOptions, TagResponse } from "./Types";

export async function TagGet(options: commonOptions): Promise<TagResponse> {
    const { guildId, name, ctx } = options;
    
    if (await TagExists({ guildId: guildId, name: name, ctx: ctx })) {
        let tags = await ctx.store.getGuild<TagResponse[]>({ guild: guildId });
        
        if (!Array.isArray(tags)) {
            tags = [];
        }
        const findTag = tags.find((tag) => tag.TagName == name);
        
        return {
              TagAuthor: findTag.TagAuthor,
              TagName: findTag.TagName,
              TagEmbedTitle: findTag.TagEmbedTitle,
              TagEmbedDescription: findTag.TagEmbedDescription,
              TagEmbedFooter: findTag.TagEmbedFooter
            };
    } else {
        return null;
    }
}