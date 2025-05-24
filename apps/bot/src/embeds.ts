import { APIEmbed, Guild } from 'discord.js';

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
        description,
        guild,
        thumbnailUrl,
        title: `Current ${configName} in Configuration`,
    });
}

export function createConfigurationListEmbed({
    description,
    guild,
    thumbnailUrl,
    title,
}: {
    description: string;
    guild: Guild;
    thumbnailUrl?: string;
    title: string;
}): APIEmbed {
    const embed = {
        color: global.embedColor,
        description: description || 'No items',
        thumbnail: {
            url: thumbnailUrl ?? guild.iconURL() ?? '',
        },
        title,
    } as APIEmbed;

    if (thumbnailUrl) {
        embed.thumbnail.url = thumbnailUrl;
    } else if (guild.iconURL()) {
        embed.thumbnail.url = guild.iconURL()!;
    }

    return embed;
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
        description,
        guild,
        thumbnailUrl,
        title: `Current ${configName} in Configuration`,
    });
}
