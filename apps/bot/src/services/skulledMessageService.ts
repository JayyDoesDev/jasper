import { Snowflake } from 'discord.js';

import { Context } from '../classes/context';
import { getGuild } from '../db';
import TagSchema, { GuildDocument } from '../models/guildSchema';

import { CommonCondition, Service } from './service';

export type Options = {
    guildId: Snowflake;
};

export class SkulledMessageService extends Service {
    private guildId?: Snowflake;

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = '';
    }

    public async add(messageId: Snowflake): Promise<CommonCondition<boolean>> {
        if (!this.guildId) throw new Error('GuildId is required');

        const guild = await getGuild<GuildDocument>(this.ctx, this.guildId);
        if (!guild.SkulledMessages) guild.SkulledMessages = [];

        if (guild.SkulledMessages.includes(messageId)) return false;

        guild.SkulledMessages.push(messageId);
        await this.ctx.store.setForeignKey({ guild: this.guildId }, guild);
        await TagSchema.updateOne(
            { _id: this.guildId },
            { $addToSet: { SkulledMessages: messageId } },
            { upsert: true },
        );

        return true;
    }

    public configure<T>(config: T): this {
        const options = config as unknown as Options;
        this.guildId = options.guildId;
        return this;
    }
}

export default SkulledMessageService;
