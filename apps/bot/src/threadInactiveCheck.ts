import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MessageActionRowComponentBuilder,
    MessageFlags,
    RESTJSONErrorCodes,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThreadChannel,
} from 'discord.js';

import { Context } from './classes/context';
import { InactiveThread, Options } from './services/inactiveThreadsService';

export async function cleanUpExpiredThreads(ctx: Context) {
    if (!ctx || !ctx.guilds) return;

    const inactiveThreadService = ctx.services.inactiveThreads;

    try {
        const allGuilds = ctx.guilds.cache;

        for (const [guildId] of allGuilds) {
            try {
                const inactiveThreads = await inactiveThreadService.getMultiValues<
                    string,
                    InactiveThread[]
                >(guildId);

                if (
                    !inactiveThreads ||
                    !Array.isArray(inactiveThreads) ||
                    inactiveThreads.length === 0
                )
                    continue;

                for (const threadData of inactiveThreads) {
                    try {
                        const thread = (await ctx.channels.fetch(
                            threadData.threadId,
                        )) as ThreadChannel;
                        if (thread.archived) {
                            await inactiveThreadService.deleteValue<Options, boolean>({
                                guildId,
                                threadId: threadData.threadId,
                            });
                        }
                    } catch (error: unknown) {
                        const discordError = error as { code?: number };
                        if (
                            discordError.code === RESTJSONErrorCodes.UnknownChannel ||
                            discordError.code === RESTJSONErrorCodes.UnknownMessage ||
                            discordError.code === RESTJSONErrorCodes.MissingAccess
                        ) {
                            await inactiveThreadService.deleteValue<Options, boolean>({
                                guildId,
                                threadId: threadData.threadId,
                            });
                        } else {
                            console.error(
                                `[Error checking thread ${threadData.threadId} during cleanup]:`,
                                error,
                            );
                        }
                    }
                }
            } catch (error) {
                console.error(`[Error cleaning up guild ${guildId}]:`, error);
            }
        }
    } catch (error) {
        console.error('[Error in cleanUpExpiredThreads]:', error);
    }
}

export async function cleanUpInactiveThreads(
    ctx: Context,
    warningTimeMinutes: number,
    graceTimeMinutes: number,
) {
    if (!ctx || !ctx.guilds) {
        console.error('[Error] Discord client is not properly initialized in the context.');
        return;
    }

    const INACTIVITY_WARNING_TIME = warningTimeMinutes * 60 * 1000;
    const GRACE_TIME_AFTER_WARNING = graceTimeMinutes * 60 * 1000;

    const inactiveThreadService = ctx.services.inactiveThreads;

    try {
        const allGuilds = ctx.guilds.cache;

        for (const [guildId] of allGuilds) {
            try {
                const inactiveThreads = await inactiveThreadService.getMultiValues<
                    string,
                    InactiveThread[]
                >(guildId);

                if (
                    !inactiveThreads ||
                    !Array.isArray(inactiveThreads) ||
                    inactiveThreads.length === 0
                )
                    continue;

                for (const threadData of inactiveThreads) {
                    try {
                        const thread = (await ctx.channels.fetch(
                            threadData.threadId,
                        )) as ThreadChannel;

                        if (thread.archived) {
                            await inactiveThreadService.deleteValue<Options, boolean>({
                                guildId,
                                threadId: threadData.threadId,
                            });
                            continue;
                        }

                        // Check if the thread author is still in the server
                        const guild = ctx.guilds.cache.get(guildId);
                        if (guild) {
                            try {
                                await guild.members.fetch(threadData.authorId);
                            } catch (error: unknown) {
                                const discordError = error as { code?: number };
                                if (discordError.code === RESTJSONErrorCodes.UnknownMember) {
                                    // Author left the server, close the thread
                                    const cv2ClosingMessage = new ContainerBuilder()
                                        .addTextDisplayComponents(
                                            new TextDisplayBuilder().setContent(
                                                `## This thread has been closed because the original poster left the server.`,
                                            ),
                                        )
                                        .addSeparatorComponents(
                                            new SeparatorBuilder()
                                                .setSpacing(SeparatorSpacingSize.Small)
                                                .setDivider(true),
                                        );

                                    await thread.send({
                                        components: [cv2ClosingMessage],
                                        flags: MessageFlags.IsComponentsV2,
                                    });

                                    await thread.setLocked(
                                        true,
                                        `Locking thread <#${thread.id}> (${thread.id}) from <@${threadData.authorId}> (${threadData.authorId}) because the OP left the server.`,
                                    );
                                    await thread.setArchived(
                                        true,
                                        `Archiving thread <#${thread.id}> (${thread.id}) from <@${threadData.authorId}> (${threadData.authorId}) because the OP left the server.`,
                                    );
                                    await inactiveThreadService.deleteValue<Options, boolean>({
                                        guildId,
                                        threadId: threadData.threadId,
                                    });
                                    continue;
                                }
                            }
                        }

                        const now = Date.now();
                        const lastMessageTime = parseInt(threadData.lastMessageTimestamp);

                        if (threadData.warnTimestamp) {
                            const warnTime = parseInt(threadData.warnTimestamp);

                            if (now - warnTime > GRACE_TIME_AFTER_WARNING) {
                                const threadInfo = await ctx.services.inactiveThreads.getValues<
                                    Options,
                                    InactiveThread
                                >({
                                    guildId: guildId,
                                    threadId: threadData.threadId,
                                });

                                if (threadInfo && threadInfo.warnMessageId) {
                                    try {
                                        const warningMessage = await thread.messages.fetch(
                                            threadInfo.warnMessageId,
                                        );
                                        if (warningMessage) {
                                            await warningMessage.delete();
                                        }
                                    } catch (error) {
                                        console.error(
                                            `[Error deleting warning message ${threadInfo.warnMessageId}]:`,
                                            error,
                                        );
                                    }
                                }

                                const cv2ClosingMessage = new ContainerBuilder()
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            `## This thread has been closed due to inactivity.`,
                                        ),
                                    )
                                    .addSeparatorComponents(
                                        new SeparatorBuilder()
                                            .setSpacing(SeparatorSpacingSize.Small)
                                            .setDivider(true),
                                    )
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            `### If you need further assistance, please create a new thread.`,
                                        ),
                                    );

                                await thread.send({
                                    components: [cv2ClosingMessage],
                                    flags: MessageFlags.IsComponentsV2,
                                });

                                await thread.setLocked(
                                    true,
                                    `Locking the thread <#${thread.id}> (${thread.id}) from OP <@${threadData.authorId}> (${threadData.authorId}) due to OP inactivity.`,
                                );
                                await thread.setArchived(
                                    true,
                                    `Archiving the thread <#${thread.id}> (${thread.id}) from OP <@${threadData.authorId}> (${threadData.authorId}) due to OP inactivity.`,
                                );
                                await inactiveThreadService.deleteValue<Options, boolean>({
                                    guildId,
                                    threadId: threadData.threadId,
                                });
                                continue;
                            }
                        } else if (now - lastMessageTime > INACTIVITY_WARNING_TIME) {
                            const user = await ctx.users.fetch(threadData.authorId);

                            const keepOpenButton = new ButtonBuilder()
                                .setCustomId(`keep_thread_${threadData.threadId}`)
                                .setLabel('Keep Open')
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(false);

                            const closeButton = new ButtonBuilder()
                                .setCustomId(`close_thread_${threadData.threadId}`)
                                .setLabel('Close Thread')
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(false);

                            const cv2WarningEmbed = [
                                new TextDisplayBuilder().setContent(`<@${user.id}>`),
                                new ContainerBuilder()
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(
                                            "## You haven't responded in a while.\nDo you still need help with your issue?",
                                        ),
                                    )
                                    .addSeparatorComponents(
                                        new SeparatorBuilder()
                                            .setSpacing(SeparatorSpacingSize.Small)
                                            .setDivider(true),
                                    )
                                    .addActionRowComponents<MessageActionRowComponentBuilder>(
                                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                                            keepOpenButton,
                                            closeButton,
                                        ),
                                    ),
                            ];

                            const embedMessage = await thread.send({
                                components: cv2WarningEmbed,
                                flags: MessageFlags.IsComponentsV2,
                            });

                            await inactiveThreadService.addWarning<Options>({
                                guildId,
                                threadId: threadData.threadId,
                                warnMessageId: embedMessage.id,
                                warnTimestamp: embedMessage.createdTimestamp.toString(),
                            });
                        }
                    } catch (error: unknown) {
                        const discordError = error as { code?: number };
                        if (
                            discordError.code === RESTJSONErrorCodes.UnknownChannel ||
                            discordError.code === RESTJSONErrorCodes.UnknownMessage
                        ) {
                            await inactiveThreadService.deleteValue<Options, boolean>({
                                guildId,
                                threadId: threadData.threadId,
                            });
                        } else if (discordError.code === RESTJSONErrorCodes.MissingAccess) {
                            await inactiveThreadService.deleteValue<Options, boolean>({
                                guildId,
                                threadId: threadData.threadId,
                            });
                        } else {
                            console.error(
                                `[Error processing thread ${threadData.threadId}]:`,
                                error,
                            );
                        }
                    }
                }
            } catch (error) {
                console.error(`[Error processing guild ${guildId}]:`, error);
            }
        }
    } catch (error) {
        console.error('[Error in cleanUpInactiveThreads]:', error);
    }
}
