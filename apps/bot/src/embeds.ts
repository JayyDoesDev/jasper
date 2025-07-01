import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';

export function createConfigurationExistsEmbed({
    configName,
    description,
    thumbnailUrl,
}: {
    configName: string;
    description: string;
    thumbnailUrl?: string;
}): ContainerBuilder {
    return createConfigurationListEmbed({
        description,
        thumbnailUrl,
        title: `Current ${configName} in Configuration`,
    });
}

export function createConfigurationListEmbed({
    description,
    title,
}: {
    description: string;
    thumbnailUrl?: string;
    title: string;
}): ContainerBuilder {
    const container = new ContainerBuilder()
        .setAccentColor(global.embedColor)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}`))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(description || 'No items'));

    return container;
}

export function createConfigurationUpdateEmbed({
    configName,
    description,
    thumbnailUrl,
}: {
    configName: string;
    description: string;
    thumbnailUrl?: string;
}): ContainerBuilder {
    return createConfigurationListEmbed({
        description,
        thumbnailUrl,
        title: `Current ${configName} in Configuration`,
    });
}
