import { Snowflake } from '@antibot/interactions';
import { GuildDocument, InactiveThread, Tag } from '../models/guildSchema';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
    type: 'mongodb' | 'sqlite' | 'json';
    connectionString?: string;
    filePath?: string;
    options?: Record<string, any>;
}

/**
 * Core database operations interface
 */
export interface DatabaseAdapter {
    /**
     * Initialize the database connection
     */
    connect(config: DatabaseConfig): Promise<void>;

    /**
     * Close the database connection
     */
    disconnect(): Promise<void>;

    /**
     * Check if database is connected
     */
    isConnected(): boolean;

    /**
     * Find a guild by ID
     */
    findGuild(guildId: Snowflake): Promise<GuildDocument | null>;

    /**
     * Create or update a guild
     */
    upsertGuild(guild: Partial<GuildDocument>): Promise<GuildDocument>;

    /**
     * Update guild settings
     */
    updateGuild(guildId: Snowflake, updates: Partial<GuildDocument>): Promise<GuildDocument | null>;

    /**
     * Delete a guild
     */
    deleteGuild(guildId: Snowflake): Promise<boolean>;

    /**
     * Database-specific query operations (for complex queries)
     */
    query<T = any>(query: any): Promise<T>;

    /**
     * Bulk operations for migrations
     */
    bulkUpdate(filter: any, update: any): Promise<{ modifiedCount: number }>;
}

/**
 * Database factory interface
 */
export interface DatabaseFactory {
    createAdapter(config: DatabaseConfig): DatabaseAdapter;
}