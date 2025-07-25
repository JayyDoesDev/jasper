import { Snowflake } from '@antibot/interactions';
import { Redis } from 'ioredis';

import { Context } from './context';

type GuildSnowflake = Record<'guild', Snowflake>;

type UserSnowflake = Record<'user', Snowflake>;

export class Store extends Redis {
    private connected: boolean = false;
    private ctx: Context;

    constructor(protected context: Context) {
        super({
            host: context.env.get('redis_host'),
            port: context.env.get('redis_port') as number,
            retryStrategy: (times) => {
                console.error(`Redis retry attempt ${times}`);
                return Math.min(times * 100, 3000);
            },
        });
        this.ctx = context;

        this.on('connect', () => {
            console.log('Redis connected');
            this.connected = true;
        });

        this.on('error', (err) => {
            console.error('Redis error:', err);
            this.connected = false;
        });
    }

    public deleteGuild(options: GuildSnowflake | UserSnowflake): void {
        this.del(JSON.stringify(options));
    }

    public async findGuild(options: GuildSnowflake): Promise<boolean> {
        return (await this.getGuild(options)) !== null;
    }

    public async findUser(options: UserSnowflake): Promise<boolean> {
        return (await this.getUser(options)) !== null;
    }

    public async getGuild<T>(options: GuildSnowflake): Promise<null | T> {
        await this.ensureConnection();

        try {
            const key = JSON.stringify(options);
            let raw = await this.get(key);

            if (!raw && options.guild) {
                const legacyKey = `"${options.guild}"`;
                console.log('Key not found, trying legacy key:', legacyKey);
                raw = await this.get(legacyKey);

                if (raw) {
                    console.log('Found data with legacy key, migrating...');
                    await this.set(key, raw);
                    await this.del(legacyKey);
                }
            }

            if (!raw) {
                return null;
            }

            const parsed = JSON.parse(raw);
            return parsed as T;
        } catch (err) {
            console.error('Error in getGuild:', err);
            return null;
        }
    }

    public async getUser<T>(options: UserSnowflake): Promise<null | T> {
        await this.ensureConnection();
        try {
            const raw = await this.get(JSON.stringify(options));
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch (err) {
            console.error('Error in getUser:', err);
            return null;
        }
    }

    public async guildExists(options: GuildSnowflake | UserSnowflake): Promise<number> {
        await this.ensureConnection();
        return this.exists(JSON.stringify(options));
    }

    public async setForeignKey<T>(options: GuildSnowflake | UserSnowflake, data: T): Promise<void> {
        await this.ensureConnection();
        const key = JSON.stringify(options);

        await this.set(key, JSON.stringify(data));
    }

    public setKey<T>(options: GuildSnowflake | UserSnowflake, ...keys: [] | T[]): void {
        const key = JSON.stringify(options);

        this.set(key, JSON.stringify(keys || []));
    }

    public async setUserKey<T>(options: UserSnowflake, data: T): Promise<void> {
        await this.ensureConnection();
        const key = JSON.stringify(options);

        await this.set(key, JSON.stringify(data));
    }

    private async ensureConnection(): Promise<void> {
        if (!this.connected) {
            console.log('Waiting for Redis connection...');
            await new Promise<void>((resolve) => {
                if (this.connected) resolve();
                else this.once('connect', () => resolve());
            });
        }
    }
}
