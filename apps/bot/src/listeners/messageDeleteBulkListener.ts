import { writeFileSync } from 'fs';
import path from 'path';

import { Message, PartialMessage, ReadonlyCollection, Snowflake } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';

import { Listener } from './listener';

export default class MessageDeleteBulkListener extends Listener<'messageDeleteBulk'> {
    constructor(ctx: Context) {
        super(ctx, 'messageDeleteBulk');
    }

    public async execute(
        messages: ReadonlyCollection<Snowflake, Message | PartialMessage>,
    ): Promise<void> {
        const groupedMessages = new Map<string, string[]>();
        for (const message of messages.values()) {
            const channelId = message.channelId ?? 'unknown';
            const messageId = message.id ?? 'unknown';
            const username = message.author.username ?? 'unknown';
            const userId = message.author.id ?? 'unknown';
            const timestamp = Math.floor(message.createdTimestamp / 1000) ?? 'unknown';
            const content = message.content ?? 'unknown';

            const line = `${messageId}, ${username}, ${userId}, ${timestamp}, ${content}`;

            if (!groupedMessages.has(channelId)) {
                groupedMessages.set(channelId, []);
            }
            groupedMessages.get(channelId)?.push(line);
        }

        for (const [channelId, messages] of groupedMessages) {
            const filePath = path.join(__dirname, `deletedMessages-${channelId}.txt`);
            writeFileSync(filePath, messages.join('\n') + '\n\n', { encoding: 'utf-8' });

            const channel = await this.ctx.channels.fetch(channelId);
            if (channel && channel.isTextBased()) {
                const surroundingMessages = await channel.messages.fetch({
                    before: messages[messages.length - 1].split(', ')[0],
                    limit: 15,
                });

                for (const surroundingMessage of surroundingMessages.values()) {
                    const messageId = surroundingMessage.id ?? 'unknown';
                    const username = surroundingMessage.author.username ?? 'unknown';
                    const userId = surroundingMessage.author.id ?? 'unknown';
                    const timestamp =
                        Math.floor(surroundingMessage.createdTimestamp / 1000) ?? 'unknown';
                    const content = surroundingMessage.content ?? 'unknown';

                    const line = `${messageId}, ${username}, ${userId}, ${timestamp}, ${content}`;
                    groupedMessages.get(channelId)?.push(line);
                }
            }
            groupedMessages.set(
                channelId,
                groupedMessages.get(channelId)?.sort((a, b) => {
                    const tsA = parseInt(a.split(', ')[3]);
                    const tsB = parseInt(b.split(', ')[3]);
                    return tsA - tsB;
                }) ?? [],
            );
        }

        await console.log(groupedMessages);
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
