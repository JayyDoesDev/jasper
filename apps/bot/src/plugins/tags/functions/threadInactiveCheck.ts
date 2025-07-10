import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, MessageActionRowComponentBuilder, MessageFlags, RESTJSONErrorCodes, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThreadChannel } from "discord.js";

import { Context } from "../../../classes/context";
import { InactiveThread, Options } from "../../../services/inactiveThreadsService";


export async function cleanUpExpiredThreads(ctx: Context) {
    if (!ctx || !ctx.guilds) {
        console.error("[Error] Discord client is not properly initialized in the context.");
        return;
    }

    const inactiveThreadService = ctx.services.inactiveThreads;

    try {
        const allGuilds = ctx.guilds.cache;

        for (const [guildId] of allGuilds) {
            try {
                const inactiveThreads = await inactiveThreadService.getMultiValues<string, InactiveThread[]>(guildId);

                if (!inactiveThreads || !Array.isArray(inactiveThreads) || inactiveThreads.length === 0) {
                    console.log(`[DEBUG] No inactive threads found for guild ${guildId}`);
                    continue;
                }

                console.log(`[DEBUG] Cleaning up ${inactiveThreads.length} tracked threads for guild ${guildId}`);

                for (const threadData of inactiveThreads) {
                    try {
                        const thread = await ctx.channels.fetch(threadData.threadId) as ThreadChannel;

                        if (thread.archived) {
                            console.log(`[INFO] Thread ${threadData.threadId} is archived. Removing from tracking.`);
                            await inactiveThreadService.deleteValue<Options, boolean>({ guildId, threadId: threadData.threadId });
                        }

                    } catch (error: unknown) {
                        const discordError = error as { code?: number };
                        if (discordError.code === RESTJSONErrorCodes.UnknownChannel ||
                            discordError.code === RESTJSONErrorCodes.UnknownMessage ||
                            discordError.code === RESTJSONErrorCodes.MissingAccess) {
                            console.log(`[INFO] Thread ${threadData.threadId} no longer exists or is inaccessible. Removing from tracking.`);
                            await inactiveThreadService.deleteValue<Options, boolean>({ guildId, threadId: threadData.threadId });
                        } else {
                            console.error(`[Error checking thread ${threadData.threadId} during cleanup]:`, error);
                        }
                    }
                }

            } catch (error) {
                console.error(`[Error cleaning up guild ${guildId}]:`, error);
            }
        }
        console.log("[INFO] No Guilds found with inactive threads. Cleanup complete.");

    } catch (error) {
        console.error("[Error in cleanUpExpiredThreads]:", error);
    }
}

export async function cleanUpInactiveThreads(ctx: Context) {
    if (!ctx || !ctx.guilds) {
        console.error("[Error] Discord client is not properly initialized in the context.");
        return;
    }

    const INACTIVITY_WARNING_TIME = 1 * 10 * 1000;
    const GRACE_TIME_AFTER_WARNING = 1 * 20 * 1000;

    const inactiveThreadService = ctx.services.inactiveThreads;

    try {
        // Get all guilds that have inactive threads
        const allGuilds = ctx.guilds.cache;

        for (const [guildId] of allGuilds) {
            try {
                const inactiveThreads = await inactiveThreadService.getMultiValues<string, InactiveThread[]>(guildId);

                if (!inactiveThreads || !Array.isArray(inactiveThreads) || inactiveThreads.length === 0) {
                    console.log(`[DEBUG] No inactive threads found for guild ${guildId}`);
                    continue;
                }

                console.log(`[DEBUG] Processing ${inactiveThreads.length} inactive threads for guild ${guildId}`);

                for (const threadData of inactiveThreads) {
                    try {
                        const thread = await ctx.channels.fetch(threadData.threadId) as ThreadChannel;

                        if (thread.archived) {
                            console.log(`[INFO] Thread ${threadData.threadId} is archived. Removing from tracking.`);
                            await inactiveThreadService.deleteValue<Options, boolean>({ guildId, threadId: threadData.threadId });
                            continue;
                        }

                        const now = Date.now();
                        const lastMessageTime = parseInt(threadData.lastMessageTimestamp);

                        if (threadData.warnTimestamp) {
                            const warnTime = parseInt(threadData.warnTimestamp);

                            if (now - warnTime > GRACE_TIME_AFTER_WARNING) {
                                console.log(`[INFO] Closing thread ${threadData.threadId} due to inactivity after warning.`);

                                const threadInfo = await ctx.services.inactiveThreads.getValues<Options, InactiveThread>({
                                    guildId: guildId,
                                    threadId: threadData.threadId,
                                });

                                if (threadInfo && threadInfo.warnMessageId) {
                                    try {
                                        const warningMessage = await thread.messages.fetch(threadInfo.warnMessageId);
                                        if (warningMessage) {
                                            await warningMessage.delete();
                                        }
                                    } catch (error) {
                                        console.error(`[Error deleting warning message ${threadInfo.warnMessageId}]:`, error);
                                    }
                                }
                                
                                const cv2ClosingMessage = new ContainerBuilder()
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder()
                                            .setContent(`## This thread has been closed due to inactivity.`)
                                    )
                                    .addSeparatorComponents(
                                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                                    )
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder()
                                            .setContent(`### If you need further assistance, please create a new thread.`)
                                    );

                                await thread.send({
                                    components: [cv2ClosingMessage],
                                    flags: MessageFlags.IsComponentsV2,
                                });

                                await thread.setLocked(true);
                                await thread.setArchived(true);
                                await inactiveThreadService.deleteValue<Options, boolean>({ guildId, threadId: threadData.threadId });
                                continue;
                            }
                        }
                        else if (now - lastMessageTime > INACTIVITY_WARNING_TIME) {
                            console.log(`[INFO] Sending inactivity warning for thread ${threadData.threadId}.`);

                            const user = await ctx.users.fetch(threadData.authorId);

                            const keepOpenButton = new ButtonBuilder()
                                .setCustomId(`keep_thread_${threadData.threadId}`)
                                .setLabel("Keep Open")
                                .setStyle(ButtonStyle.Success)
                                .setDisabled(false);

                            const closeButton = new ButtonBuilder()
                                .setCustomId(`close_thread_${threadData.threadId}`)
                                .setLabel("Close Thread")
                                .setStyle(ButtonStyle.Danger)
                                .setDisabled(false);

                            const cv2WarningEmbed = [
                                new TextDisplayBuilder().setContent(`<@${user.id}>`),
                                new ContainerBuilder()
                                    .addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent("## You haven't responded in a while.\nDo you still need help with your issue?"),
                                    )
                                    .addSeparatorComponents(
                                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
                                    ).addActionRowComponents<MessageActionRowComponentBuilder>(
                                        new ActionRowBuilder<MessageActionRowComponentBuilder>()
                                            .addComponents(keepOpenButton, closeButton)
                                    )
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

                            console.log(`[INFO] Inactivity warning sent for thread ${threadData.threadId}.`);
                        }

                    } catch (error: unknown) {
                        const discordError = error as { code?: number };
                        if (discordError.code === RESTJSONErrorCodes.UnknownChannel || discordError.code === RESTJSONErrorCodes.UnknownMessage) {
                            console.log(`[INFO] Thread ${threadData.threadId} no longer exists. Removing from tracking.`);
                            await inactiveThreadService.deleteValue<Options, boolean>({ guildId, threadId: threadData.threadId });
                        } else if (discordError.code === RESTJSONErrorCodes.MissingAccess) {
                            console.log(`[INFO] No access to thread ${threadData.threadId}. Removing from tracking.`);
                            await inactiveThreadService.deleteValue<Options, boolean>({ guildId, threadId: threadData.threadId });
                        } else {
                            console.error(`[Error processing thread ${threadData.threadId}]:`, error);
                        }
                    }
                }
            } catch (error) {
                console.error(`[Error processing guild ${guildId}]:`, error);
            }
        }

    } catch (error) {
        console.error("[Error in cleanUpInactiveThreads]:", error);
    }
}
