import { unlinkSync, writeFileSync } from 'fs';
import path from 'path';

import { Message, PartialMessage, ReadonlyCollection, Snowflake, TextChannel } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { Listener } from './listener';

interface LoggedMessage {
    content: string;
    id: string;
    reply?: LoggedReply;
    timestamp: number;
    userId: string;
    username: string;
}

interface LoggedReply {
    content: string;
    messageid?: string;
    username: string;
}

export default class MessageDeleteBulkListener extends Listener<'messageDeleteBulk'> {
    constructor(ctx: Context) {
        super(ctx, 'messageDeleteBulk');
    }

    public async execute(
        messages: ReadonlyCollection<Snowflake, Message | PartialMessage>,
    ): Promise<void> {
        const groupedMessages = new Map<string, LoggedMessage[]>();

        const { BulkDeleteLogging } = this.ctx.services.settings.getSettings();

        for (const message of messages.values()) {
            const channelId = message.channelId ?? 'unknown';
            if (BulkDeleteLogging.IgnoredLoggingChannels?.includes(channelId)) continue;
            if (message.author?.bot) continue;

            console.log(message);
            let logMsg: LoggedMessage;

            if (message.reference) {
                let repliedMsg;
                let reply: LoggedReply;
                try {
                    repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
                    reply = {
                        content: repliedMsg.content,
                        username: repliedMsg.author.username,
                    };
                } catch {
                    const channelMsgs = groupedMessages.get(channelId);
                    if (channelMsgs) {
                        console.log('hi');
                        const localReply = channelMsgs.find(
                            (x) => x.id === message.reference.messageId,
                        );
                        reply = {
                            content: localReply?.content ?? 'pending',
                            username: localReply?.username ?? 'pending',
                        };
                    }
                    reply = {
                        content: reply.content,
                        messageid: message.reference.messageId,
                        username: reply.username,
                    };
                }
                logMsg = {
                    content: message.content ?? 'unknown',
                    id: message.id ?? 'unknown',
                    reply: reply,
                    timestamp: Math.floor(message.createdTimestamp / 1000),
                    userId: message.author?.id ?? 'unknown',
                    username: message.author?.username ?? 'unknown',
                };
            } else {
                logMsg = {
                    content: message.content ?? 'unknown',
                    id: message.id ?? 'unknown',
                    timestamp: Math.floor(message.createdTimestamp / 1000),
                    userId: message.author?.id ?? 'unknown',
                    username: message.author?.username ?? 'unknown',
                };
            }

            if (!groupedMessages.has(channelId)) {
                groupedMessages.set(channelId, []);
            }
            groupedMessages.get(channelId)!.push(logMsg);
        }

        for (const [channelId, msgs] of groupedMessages) {
            for (const msg of msgs) {
                const channelMsgs = groupedMessages.get(channelId);
                if (channelMsgs) {
                    if (msg.reply) {
                        const localReply = channelMsgs.find((x) => x.id === msg.reply.messageid);
                        if (localReply) {
                            msg.reply = {
                                content: localReply.content,
                                username: localReply.username,
                            };
                        }
                    }
                }
            }
        }

        const logChannel = (await this.ctx.channels.fetch(
            BulkDeleteLogging.LogChannel,
        )) as TextChannel;

        for (const [channelId, msgs] of groupedMessages) {
            const filePath = path.join(__dirname, `deletedMessages-${channelId}.json`);
            const channel = await this.ctx.channels.fetch(channelId);

            if (channel && channel.isTextBased()) {
                const surroundingMessages = await channel.messages.fetch({
                    before: msgs[msgs.length - 1].id,
                    limit: 15,
                });

                for (const surroundingMessage of surroundingMessages.values()) {
                    if (surroundingMessage.author.bot) continue;

                    let logMsg: LoggedMessage;

                    if (surroundingMessage.reference) {
                        let repliedMsg;
                        let reply: LoggedReply;
                        try {
                            repliedMsg = await surroundingMessage.channel.messages.fetch(
                                surroundingMessage.reference.messageId,
                            );
                            reply = {
                                content: repliedMsg.content,
                                username: repliedMsg.author.username,
                            };
                        } catch {
                            const channelMsgs = groupedMessages.get(channelId);
                            if (channelMsgs) {
                                const localReply = channelMsgs.find(
                                    (x) => x.id === surroundingMessage.reference?.messageId,
                                );
                                if (localReply) {
                                    reply = {
                                        content: localReply.content,
                                        username: localReply.username,
                                    };
                                } else {
                                    reply = {
                                        content: 'couldnt find',
                                        username: 'couldnt find',
                                    };
                                }
                            }
                        }
                        logMsg = {
                            content: surroundingMessage.content ?? 'unknown',
                            id: surroundingMessage.id ?? 'unknown',
                            reply: reply,
                            timestamp: Math.floor(surroundingMessage.createdTimestamp / 1000),
                            userId: surroundingMessage.author?.id ?? 'unknown',
                            username: surroundingMessage.author?.username ?? 'unknown',
                        };
                    } else {
                        logMsg = {
                            content: surroundingMessage.content ?? 'unknown',
                            id: surroundingMessage.id ?? 'unknown',
                            timestamp: Math.floor(surroundingMessage.createdTimestamp / 1000),
                            userId: surroundingMessage.author?.id ?? 'unknown',
                            username: surroundingMessage.author?.username ?? 'unknown',
                        };
                    }
                    groupedMessages.get(channelId)!.push(logMsg);
                }
            }

            groupedMessages.set(
                channelId,
                groupedMessages.get(channelId)!.sort((a, b) => {
                    const tsA = typeof a.timestamp === 'number' ? a.timestamp : 0;
                    const tsB = typeof b.timestamp === 'number' ? b.timestamp : 0;
                    return tsA - tsB;
                }),
            );

            const orderedMsgs = groupedMessages.get(channelId)!;
            writeFileSync(filePath, JSON.stringify(orderedMsgs, null, 2), {
                encoding: 'utf-8',
            });
            await logChannel.send({ files: [filePath] });
            unlinkSync(filePath);
        }
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: (messages: ReadonlyCollection<Snowflake, Message | PartialMessage>) =>
                this.execute(messages),
        });
    }
}
