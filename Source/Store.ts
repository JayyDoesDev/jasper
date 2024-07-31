import type { Snowflake } from "@antibot/interactions";
import { Redis } from "ioredis";
import { Context } from "./Context";
import { GuildSnowflake } from "../Plugins/Tags/Controllers/Types";

export class Store extends Redis {
    #ctx: Context;
    constructor(protected readonly ctx: Context) {
        super({
            host: process.env.REDISHOST as string,
            port: process.env.REDISPORT as unknown as number
        });
        this.#ctx = ctx;
    }

    public async getGuild<T>(options: GuildSnowflake): Promise<T> {
        return JSON.parse(await this.get(JSON.stringify(options)));
    }

    public async findGuild(options: GuildSnowflake): Promise<boolean> {
        return await this.getGuild(options) ? true : false;
    }

    public deleteGuild(options: GuildSnowflake): void{
        this.del(JSON.stringify(options));
    }

    public setKey<T>(options: GuildSnowflake, ...keys: T[] | []): void {
         this.set(JSON.stringify(options), JSON.stringify(keys || []));
    }

    public guildExists(options: GuildSnowflake): Promise<number> {
        return this.exists(JSON.stringify(options));
    }
}
