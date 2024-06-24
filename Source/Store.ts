import type { Snowflake } from "@antibot/interactions";
import { Redis, RedisOptions } from "ioredis";
import { TagGetPromise } from "../Plugins/Tags/Controllers/TagGet";
import { Context } from "./Context";

type GuildOptions = { guild: Snowflake };
export class Store extends Redis {
    #ctx: Context;
    constructor(protected readonly ctx: Context) {
        super({
            host: process.env.REDISHOST as string,
            port: process.env.REDISPORT as unknown as number
        });
        this.#ctx = ctx;
    }

    public async getGuild<T>(options: GuildOptions): Promise<T> {
        return JSON.parse(await this.get(JSON.stringify(options)));
    }

    public async findGuild(options: GuildOptions): Promise<boolean> {
        return await this.getGuild(options) ? true : false;
    }

    public async deleteGuild(options: GuildOptions): Promise<void> {
        await this.del(JSON.stringify(options));
    }

    public async setKey<T>(options: GuildOptions, ...keys: T[] | []): Promise<void> {
        await this.set(JSON.stringify(options), JSON.stringify(keys || []));
    }

    public async guildExists(options: GuildOptions): Promise<number> {
        return await this.exists(JSON.stringify(options));
    }
}
