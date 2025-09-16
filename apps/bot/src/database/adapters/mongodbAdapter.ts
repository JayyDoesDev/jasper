import { Snowflake } from '@antibot/interactions';
import mongoose from 'mongoose';
import { DatabaseAdapter, DatabaseConfig } from '../interfaces';
import GuildSchema, { GuildDocument } from '../../models/guildSchema';

export class MongoDBAdapter implements DatabaseAdapter {
    private connected = false;

    async connect(config: DatabaseConfig): Promise<void> {
        if (!config.connectionString) {
            throw new Error('MongoDB connection string is required');
        }

        await mongoose.connect(config.connectionString, {
            maxPoolSize: 10,
            ...config.options,
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB database connected');
            this.connected = true;
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB database disconnected');
            this.connected = false;
        });

        this.connected = true;
    }

    async disconnect(): Promise<void> {
        await mongoose.connection.close();
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected && mongoose.connection.readyState === 1;
    }

    async findGuild(guildId: Snowflake): Promise<GuildDocument | null> {
        return await GuildSchema.findOne({ _id: guildId });
    }

    async upsertGuild(guild: Partial<GuildDocument>): Promise<GuildDocument> {
        const result = await GuildSchema.findOneAndUpdate(
            { _id: guild._id },
            guild,
            { upsert: true, new: true }
        );
        return result;
    }

    async updateGuild(guildId: Snowflake, updates: Partial<GuildDocument>): Promise<GuildDocument | null> {
        return await GuildSchema.findOneAndUpdate(
            { _id: guildId },
            updates,
            { new: true }
        );
    }

    async deleteGuild(guildId: Snowflake): Promise<boolean> {
        const result = await GuildSchema.deleteOne({ _id: guildId });
        return result.deletedCount > 0;
    }

    async query<T = any>(query: any): Promise<T> {
        // For direct mongoose queries
        return await GuildSchema.find(query) as T;
    }

    async bulkUpdate(filter: any, update: any): Promise<{ modifiedCount: number }> {
        const result = await GuildSchema.updateMany(filter, update);
        return { modifiedCount: result.modifiedCount };
    }
}