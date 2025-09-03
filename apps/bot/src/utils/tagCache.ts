import { AutocompleteInteraction, Collection } from 'discord.js';

import { Context } from '../classes/context';
import { TagResponse } from '../services/tagService';

import { safeAutocompleteRespond } from './interactionSafeguards';

interface CacheEntry {
    expiry: number;
    tags: string[];
}

export class TagCache {
    private static instance: TagCache;
    private cache: Collection<string, CacheEntry>;
    private readonly CACHE_TTL = 45000;
    private cleanupInterval: NodeJS.Timeout;

    private constructor() {
        this.cache = new Collection<string, CacheEntry>();
        this.startCleanupInterval();
    }

    public static getInstance(): TagCache {
        if (!TagCache.instance) {
            TagCache.instance = new TagCache();
        }
        return TagCache.instance;
    }

    public clearAllCache(): void {
        this.cache.clear();
    }

    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
    }

    public getCachedTagNames(guildId: string): null | string[] {
        const cached = this.cache.get(guildId);
        if (cached && Date.now() < cached.expiry) {
            return cached.tags;
        }
        this.cache.delete(guildId);
        return null;
    }

    public getCacheSize(): number {
        return this.cache.size;
    }

    public getCacheStats(): { expiredEntries: number; totalEntries: number; validEntries: number } {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        this.cache.forEach((entry) => {
            if (now < entry.expiry) {
                validEntries++;
            } else {
                expiredEntries++;
            }
        });

        return {
            expiredEntries,
            totalEntries: this.cache.size,
            validEntries,
        };
    }

    public invalidateCache(guildId: string): void {
        this.cache.delete(guildId);
    }

    public setCachedTagNames(guildId: string, tags: string[]): void {
        this.cache.set(guildId, {
            expiry: Date.now() + this.CACHE_TTL,
            tags,
        });
    }

    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            this.cache.sweep((entry) => now >= entry.expiry);
        }, 60000);
    }
}

export const tagCache = TagCache.getInstance();

export function getCachedTagNames(guildId: string): null | string[] {
    return tagCache.getCachedTagNames(guildId);
}

export async function handleTagAutocomplete(
    ctx: Context,
    interaction: AutocompleteInteraction,
): Promise<void> {
    try {
        const guildId = interaction.guildId!;
        const query = interaction.options.getString('tag-name') || '';

        // Try to get cached tag names first
        let tagNames = getCachedTagNames(guildId);

        if (!tagNames) {
            try {
                const timeoutPromise = new Promise<TagResponse[]>((_, reject) => {
                    setTimeout(() => reject(new Error('Autocomplete timeout')), 1200);
                });
                const tags = await Promise.race([
                    ctx.services.tags.getMultiValues<string, TagResponse[]>(guildId),
                    timeoutPromise,
                ]);
                tagNames = tags.map((tag) => tag.TagName);
                setCachedTagNames(guildId, tagNames);
            } catch {
                await safeAutocompleteRespond(interaction, []);
                return;
            }
        }

        const filtered = tagNames
            .filter((tagName) => tagName.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((tagName) => ({ name: tagName, value: tagName }));

        await safeAutocompleteRespond(interaction, filtered);
    } catch {
        await safeAutocompleteRespond(interaction, []);
    }
}

export function invalidateTagCache(guildId: string): void {
    tagCache.invalidateCache(guildId);
}

export function setCachedTagNames(guildId: string, tags: string[]): void {
    tagCache.setCachedTagNames(guildId, tags);
}
