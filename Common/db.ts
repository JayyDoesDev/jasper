import GuildSchema from "../Models/GuildSchema";
import UserSchema from "../Models/UserSchema";
import { Snowflake } from "@antibot/interactions";
import { Context } from "../Source/Context";
import _ from "lodash";

export async function userExists(userId: Snowflake): Promise<boolean> {
    return await UserSchema.findOne({ _id: userId }) ? true : false;
}

export async function guildExists(guildId: Snowflake): Promise<boolean> {
    return await GuildSchema.findOne({ _id: guildId }) ? true : false;
}

export async function getGuild<R extends object>(ctx: Context,  guildId: Snowflake): Promise<R> {
    const guildInCache = await ctx.store.findGuild({ guild: guildId });
    
    if (!guildInCache) {
        try {
            const guildInDb = await GuildSchema.findOne({ _id: guildId });

            if (guildInDb) {
                ctx.store.setForeignKey({ guild: guildId }, guildInDb);
                return <R>guildInDb;
            } else {
                const newGuild = new GuildSchema({ _id: guildId });
                await newGuild.save();

                ctx.store.setForeignKey({ guild: guildId }, newGuild);

                return <R>newGuild;
            }
        } catch (error) {
            console.error("Error trying to find or create a guild", error);
        }
    } else {
        const guildInDb = await GuildSchema.findOne({ _id: guildId });
        if (guildInDb && !_.isEqual(guildInCache, guildInDb)) {
            ctx.store.setForeignKey({ guild: guildId }, guildInDb);
        }

        return ctx.store.getGuild({ guild: guildId });
    }
}