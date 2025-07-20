import { ButtonInteraction, ButtonStyle, ComponentType, ContainerBuilder } from 'discord.js';

interface PaginationConfig {
    buildContainer: (pageContent: string, pageFooter: string) => ContainerBuilder[];
    buttonIdPrefix: string;
    currentPage: number;
    fetchTotalItemCount: () => Promise<number>;
    interaction: ButtonInteraction;
    items: string[];
    totalPages: number;
    userId: string;
}

export async function handlePagination(config: PaginationConfig) {
    const {
        buildContainer,
        buttonIdPrefix,
        currentPage,
        fetchTotalItemCount,
        interaction,
        items,
        totalPages,
        userId,
    } = config;

    let page = currentPage;
    switch (interaction.customId) {
        case `${buttonIdPrefix}_home_${userId}`:
            page = 0;
            break;
        case `${buttonIdPrefix}_next_${userId}`:
            page = (page + 1) % totalPages;
            break;
        case `${buttonIdPrefix}_previous_${userId}`:
            page = (page - 1 + totalPages) % totalPages;
            break;
    }

    const startIndex = page * 10;
    const displayText = items
        .slice(startIndex, startIndex + 10)
        .map((str, i) => `**${startIndex + i + 1}.** *${str}*`)
        .join('\n');

    const totalItemCount = await fetchTotalItemCount();
    const footer = `Page: ${page + 1}/${totalPages} • Total Topics: ${totalItemCount}`;

    const container = buildContainer(displayText, footer);

    const row = {
        components: [
            {
                customId: `${buttonIdPrefix}_previous_${userId}`,
                disabled: page === 0,
                label: 'Previous',
                style: ButtonStyle.Primary,
                type: ComponentType.Button,
            } as const,
            {
                customId: `${buttonIdPrefix}_home_${userId}`,
                label: 'Home',
                style: ButtonStyle.Secondary,
                type: ComponentType.Button,
            } as const,
            {
                customId: `${buttonIdPrefix}_next_${userId}`,
                disabled: page === totalPages - 1,
                label: 'Next',
                style: ButtonStyle.Primary,
                type: ComponentType.Button,
            } as const,
        ],
        type: ComponentType.ActionRow,
    } as const;

    await interaction.update({
        components: [...container, row],
    });

    return page;
}
