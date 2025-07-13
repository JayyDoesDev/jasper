import { Snowflake } from 'discord.js';

import { Context } from '../classes/context';
import { getGuild } from '../db';
import TagSchema, { GuildDocument } from '../models/guildSchema';

import { CommonCondition, Service } from './service';

export type InactiveThread = {
    authorId: Snowflake;
    lastMessageId: Snowflake;
    lastMessageTimestamp: Snowflake;
    threadId: Snowflake;
    warnMessageId?: Snowflake;
    warnTimestamp?: Snowflake;
};

export type Options = {
    guildId: Snowflake;
    threadId: Snowflake;
};

class InactiveThreadService extends Service {
    private guildId: Snowflake;
    private inactiveThread: InactiveThread;

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = '';
        this.inactiveThread = {
            authorId: '',
            lastMessageId: '',
            lastMessageTimestamp: '',
            threadId: '',
        };
    }

    public async addWarning<T>(
        options?: T extends Options
            ? Options & { warnMessageId: Snowflake; warnTimestamp: Snowflake }
            : null,
    ): Promise<CommonCondition<InactiveThread | null>> {
        let guildId = this.guildId;
        let threadId = this.inactiveThread.threadId;

        if (!this.checkConfig() && options) {
            guildId = options.guildId;
            threadId = options.threadId;
        }

        if (!guildId || !threadId || !options?.warnMessageId || !options?.warnTimestamp) {
            throw new Error(
                'GuildId, threadId, warnMessageId, and warnTimestamp are required to add warning',
            );
        }

        return this.modify<
            Options & { inactiveThread?: Partial<InactiveThread> },
            InactiveThread | null
        >({
            guildId,
            inactiveThread: {
                warnMessageId: options.warnMessageId,
                warnTimestamp: options.warnTimestamp,
            },
            threadId,
        });
    }

    public configure<T>(
        config: T extends Options ? Options & { inactiveThread?: InactiveThread } : null,
    ): this {
        this.guildId = config?.guildId ?? '';
        this.inactiveThread = config?.inactiveThread ?? {
            authorId: '',
            lastMessageId: '',
            lastMessageTimestamp: '',
            threadId: config?.threadId ?? '',
        };

        return this;
    }

    public async create<T, R>(
        create?: T extends Options ? Options & { inactiveThread?: InactiveThread } : null,
    ): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let inactiveThread = this.inactiveThread;

        if (!this.checkConfig() && create) {
            guildId = create.guildId;
            inactiveThread = create.inactiveThread ?? {
                authorId: '',
                lastMessageId: '',
                lastMessageTimestamp: '',
                threadId: create.threadId ?? '',
            };
        }

        if (!guildId || !inactiveThread.threadId) {
            throw new Error(
                'GuildId and threadId are required to create an inactive thread record',
            );
        }

        if (await this.itemExists<Options>({ guildId, threadId: inactiveThread.threadId })) {
            throw new Error(
                `Inactive thread "${inactiveThread.threadId}" already exists in guild ${guildId}`,
            );
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        if (!guild.InactiveThreads) {
            guild.InactiveThreads = [];
        }

        guild.InactiveThreads.push(inactiveThread);
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            {
                $push: { InactiveThreads: inactiveThread },
                $setOnInsert: { _id: guildId },
            },
            { upsert: true },
        );

        return <CommonCondition<R>>inactiveThread;
    }

    public async deleteValue<T, R>(
        d?: T extends Options ? Options : null,
    ): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let threadId = this.inactiveThread.threadId;

        if (!this.checkConfig() && d) {
            guildId = d.guildId;
            threadId = d.threadId;
        }

        if (!guildId || !threadId) {
            throw new Error('GuildId and threadId are required for inactive thread deletion');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const threadExists = await this.itemExists<Options>({ guildId, threadId });

        if (!threadExists) {
            return <CommonCondition<R>>false;
        }

        if (!guild.InactiveThreads) {
            return <CommonCondition<R>>false;
        }

        const index = guild.InactiveThreads.findIndex((thread) => thread.threadId === threadId);
        if (index === -1) {
            return <CommonCondition<R>>false;
        }

        guild.InactiveThreads.splice(index, 1);
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne({ _id: guildId }, { $pull: { InactiveThreads: { threadId } } });

        return <CommonCondition<R>>true;
    }

    public async getMultiValues<T, R>(
        getMultiValues?: T extends Snowflake ? Snowflake : null,
    ): Promise<CommonCondition<R extends InactiveThread[] ? InactiveThread[] : null>> {
        let guildId = this.guildId;

        if (!this.checkConfig() && getMultiValues) {
            guildId = getMultiValues;
        }

        if (!guildId) {
            throw new Error('GuildId is required to get multiple inactive threads');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const inactiveThreads = guild.InactiveThreads;

        if (!inactiveThreads?.length) {
            return <CommonCondition<R extends InactiveThread[] ? InactiveThread[] : null>>[];
        }

        return <CommonCondition<R extends InactiveThread[] ? InactiveThread[] : null>>(
            inactiveThreads
        );
    }

    public async getValues<T, R>(
        get?: T extends Options ? Options : null,
    ): Promise<CommonCondition<R extends InactiveThread ? InactiveThread : null>> {
        let guildId = this.guildId;
        let threadId = this.inactiveThread.threadId;

        if (!this.checkConfig() && get) {
            guildId = get.guildId;
            threadId = get.threadId;
        }

        if (!guildId || !threadId) {
            throw new Error('GuildId and threadId are required to get inactive thread values');
        }

        if (!(await this.itemExists<Options>({ guildId, threadId }))) {
            return null;
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const inactiveThread = guild.InactiveThreads?.find(
            (thread) => thread.threadId === threadId,
        );

        if (!inactiveThread) {
            return null;
        }

        return <CommonCondition<R extends InactiveThread ? InactiveThread : null>>inactiveThread;
    }

    public async itemExists<T>(
        exists?: T extends Options ? Options : null,
    ): Promise<CommonCondition<boolean>> {
        let guildId = this.guildId;
        let threadId = this.inactiveThread.threadId;

        if (!this.checkConfig() && exists) {
            guildId = exists.guildId;
            threadId = exists.threadId;
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const inactiveThreads = guild.InactiveThreads;

        if (inactiveThreads?.find((thread) => thread.threadId === threadId)) return true;

        return false;
    }

    public async modify<T, R>(
        mod?: T extends Options ? Options & { inactiveThread?: Partial<InactiveThread> } : null,
    ): Promise<CommonCondition<R>> {
        let guildId = this.guildId;
        let threadId = this.inactiveThread.threadId;
        const inactiveThreadUpdate = mod?.inactiveThread;

        if (!this.checkConfig() && mod) {
            guildId = mod.guildId;
            threadId = mod.threadId;
        }

        if (!guildId || !threadId) {
            throw new Error('GuildId and threadId are required for inactive thread modification');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const threadInDb = guild.InactiveThreads?.find((thread) => thread.threadId === threadId);

        if (!threadInDb) {
            throw new Error(`Inactive thread "${threadId}" not found in guild ${guildId}`);
        }

        if (!guild.InactiveThreads) {
            throw new Error(`No inactive threads found in guild ${guildId}`);
        }

        const index = guild.InactiveThreads.findIndex((thread) => thread.threadId === threadId);

        const updatedThread = {
            ...threadInDb,
            ...inactiveThreadUpdate,
            threadId,
        };

        guild.InactiveThreads[index] = updatedThread;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            {
                _id: guildId,
                'InactiveThreads.threadId': threadId,
            },
            {
                $set: {
                    'InactiveThreads.$': updatedThread,
                },
            },
        );

        return <CommonCondition<R>>null;
    }

    public async removeWarning<T>(
        options?: T extends Options ? Options : null,
    ): Promise<CommonCondition<InactiveThread | null>> {
        let guildId = this.guildId;
        let threadId = this.inactiveThread.threadId;

        if (!this.checkConfig() && options) {
            guildId = options.guildId;
            threadId = options.threadId;
        }

        if (!guildId || !threadId) {
            throw new Error('GuildId and threadId are required to remove warning');
        }

        return this.modify<
            Options & { inactiveThread?: Partial<InactiveThread> },
            InactiveThread | null
        >({
            guildId,
            inactiveThread: {
                lastMessageTimestamp: new Date().getTime().toString(),
                warnMessageId: undefined,
                warnTimestamp: undefined,
            },
            threadId,
        });
    }

    private checkConfig(): boolean {
        return Boolean(this.guildId && this.inactiveThread.threadId);
    }
}

export default InactiveThreadService;
