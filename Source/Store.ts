import type { Snowflake } from "@antibot/interactions";
import { Redis, RedisOptions } from "ioredis";
import { TagGetPromise } from "../Plugins/Tags/Controllers/TagGet";
import { Context } from "./Context";

type GuildOptions = Record<"guild", Snowflake>;
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

    public deleteGuild(options: GuildOptions): void{
        this.del(JSON.stringify(options));
    }

    public setKey<T>(options: GuildOptions, ...keys: T[] | []): void {
         this.set(JSON.stringify(options), JSON.stringify(keys || []));
    }

    public guildExists(options: GuildOptions): Promise<number> {
        return this.exists(JSON.stringify(options));
    }
}
