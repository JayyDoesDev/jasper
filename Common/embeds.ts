import { APIEmbed, Guild } from 'discord.js';

export function createConfigurationListEmbed({
    title,
    description,
    guild,
    thumbnailUrl,
}: {
    title: string;
    description: string;
    guild: Guild;
    thumbnailUrl?: string;
}): APIEmbed {
    const embed = {
        title,
        description: description || 'No items',
        color: global.embedColor,
        thumbnail: {
            url: thumbnailUrl ?? guild.iconURL() ?? '',
        },
    } as APIEmbed;

    if (thumbnailUrl) {
        embed.thumbnail.url = thumbnailUrl;
    } else if (guild.iconURL()) {
        embed.thumbnail.url = guild.iconURL()!;
    }

    return embed;
}

export function createConfigurationExistsEmbed({
    configName,
    description,
    guild,
    thumbnailUrl,
}: {
    configName: string;
    description: string;
    guild: Guild;
    thumbnailUrl?: string;
}): APIEmbed {
    return createConfigurationListEmbed({
        title: `Current ${configName} in Configuration`,
        description,
        guild,
        thumbnailUrl,
    });
}

export function createConfigurationUpdateEmbed({
    configName,
    description,
    guild,
    thumbnailUrl,
}: {
    configName: string;
    description: string;
    guild: Guild;
    thumbnailUrl?: string;
}): APIEmbed {
    return createConfigurationListEmbed({
        title: `Current ${configName} in Configuration`,
        description,
        guild,
        thumbnailUrl,
    });
}
