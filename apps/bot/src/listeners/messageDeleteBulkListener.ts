import { writeFileSync } from 'fs';
import path from 'path';

import { Message, PartialMessage, ReadonlyCollection, Snowflake, TextChannel } from 'discord.js';

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

        const { BulkDeleteLogging } = this.ctx.services.settings.getSettings();
        for (const message of messages.values()) {
            const channelId = message.channelId ?? 'unknown';
            if (BulkDeleteLogging.IgnoredLoggingChannels?.includes(channelId)) return;
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

        const logChannel = (await this.ctx.channels.fetch(
            BulkDeleteLogging.LogChannel,
        )) as TextChannel;

        for (const [channelId, messages] of groupedMessages) {
            const filePath = path.join(__dirname, `deletedMessages-${channelId}.txt`);
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
            const orderedMsgs = groupedMessages.get(channelId) ?? [];
            writeFileSync(filePath, orderedMsgs.join('\n') + '\n\n', { encoding: 'utf-8' });
            await logChannel.send({ files: [filePath] });
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
