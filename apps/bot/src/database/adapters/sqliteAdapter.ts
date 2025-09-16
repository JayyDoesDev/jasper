import { Snowflake } from '@antibot/interactions';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { DatabaseAdapter, DatabaseConfig } from '../interfaces';
import { GuildDocument } from '../../models/guildSchema';

export class SQLiteAdapter implements DatabaseAdapter {
    private db: Database.Database | null = null;
    private connected = false;

    async connect(config: DatabaseConfig): Promise<void> {
        if (!config.filePath) {
            throw new Error('SQLite file path is required');
        }

        // Ensure directory exists
        const dir = path.dirname(config.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.db = new Database(config.filePath);
        this.initializeSchema();
        this.connected = true;
        console.log('SQLite database connected');
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        this.connected = false;
        console.log('SQLite database disconnected');
    }

    isConnected(): boolean {
        return this.connected && this.db !== null;
    }

    private initializeSchema(): void {
        if (!this.db) return;

        // Create guilds table with JSON column for settings
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guilds (
                id TEXT PRIMARY KEY,
                guild_settings TEXT NOT NULL,
                inactive_threads TEXT,
                skulled_messages TEXT,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create trigger to update updated_at
        this.db.exec(`
            CREATE TRIGGER IF NOT EXISTS guilds_updated_at 
            AFTER UPDATE ON guilds
            BEGIN
                UPDATE guilds SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        `);
    }

    async findGuild(guildId: Snowflake): Promise<GuildDocument | null> {
        if (!this.db) return null;

        const stmt = this.db.prepare('SELECT * FROM guilds WHERE id = ?');
        const row = stmt.get(guildId) as any;

        if (!row) return null;

        return this.rowToGuildDocument(row);
    }

    async upsertGuild(guild: Partial<GuildDocument>): Promise<GuildDocument> {
        if (!this.db || !guild._id) {
            throw new Error('Database not connected or guild ID missing');
        }

        const existingGuild = await this.findGuild(guild._id);
        const guildData = existingGuild 
            ? { ...existingGuild, ...guild }
            : this.createDefaultGuild(guild._id, guild);

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO guilds (
                id, guild_settings, inactive_threads, skulled_messages, tags
            ) VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(
            guildData._id,
            JSON.stringify(guildData.GuildSettings),
            JSON.stringify(guildData.InactiveThreads || []),
            JSON.stringify(guildData.SkulledMessages || []),
            JSON.stringify(guildData.Tags || [])
        );

        return guildData;
    }

    async updateGuild(guildId: Snowflake, updates: Partial<GuildDocument>): Promise<GuildDocument | null> {
        const existingGuild = await this.findGuild(guildId);
        if (!existingGuild) return null;

        const updatedGuild = { ...existingGuild, ...updates };
        await this.upsertGuild(updatedGuild);
        return updatedGuild;
    }

    async deleteGuild(guildId: Snowflake): Promise<boolean> {
        if (!this.db) return false;

        const stmt = this.db.prepare('DELETE FROM guilds WHERE id = ?');
        const result = stmt.run(guildId);
        return result.changes > 0;
    }

    async query<T = any>(query: any): Promise<T> {
        if (!this.db) return [] as T;

        let sql = 'SELECT * FROM guilds';
        const params: any[] = [];

        const queryObj = query as Record<string, any>;
        if ('$or' in queryObj && queryObj.$or) {
            // Handle $or queries (used in migrations)
            const conditions = queryObj.$or.map(() => this.buildCondition(params)).join(' OR ');
            sql += ` WHERE ${conditions}`;
        } else if ('_id' in queryObj && queryObj._id) {
            sql += ' WHERE id = ?';
            params.push(queryObj._id);
        }

        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        const guilds = rows.map(row => this.rowToGuildDocument(row));

        if ('$or' in queryObj && queryObj.$or) {
            // Filter results based on the $or conditions
            return guilds.filter(guild => {
                return queryObj.$or.some((condition: any) => this.matchesCondition(guild, condition));
            }) as T;
        }

        return guilds as T;
    }

    private buildCondition(params: any[]): string {
        // For complex queries, we'll need to parse the JSON in SQL
        // This is a simplified version - in practice you might want to use JSON functions
        return '1=1'; // Fallback to fetch all and filter in memory
    }

    private matchesCondition(guild: any, condition: any): boolean {
        for (const [key, value] of Object.entries(condition)) {
            if (key.includes('.')) {
                const nestedValue = this.getNestedValue(guild, key);
                if (value && typeof value === 'object') {
                    const operators = value as Record<string, any>;
                    if ('$exists' in operators) {
                        const exists = nestedValue !== undefined && nestedValue !== null;
                        if (exists !== operators.$exists) return false;
                    }
                    if ('$eq' in operators && nestedValue !== operators.$eq) return false;
                    if ('$size' in operators) {
                        if (!Array.isArray(nestedValue)) return operators.$size === 0;
                        if (nestedValue.length !== operators.$size) return false;
                    }
                } else if (nestedValue !== value) {
                    return false;
                }
            }
        }
        return true;
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    async bulkUpdate(filter: any, update: any): Promise<{ modifiedCount: number }> {
        const guilds = await this.query(filter);
        let modifiedCount = 0;

        if (Array.isArray(guilds)) {
            for (const guild of guilds) {
                const updateOperators = update as Record<string, any>;
                if ('$set' in updateOperators && updateOperators.$set) {
                    for (const [key, value] of Object.entries(updateOperators.$set)) {
                        this.setNestedValue(guild, key, value);
                    }
                    await this.upsertGuild(guild);
                    modifiedCount++;
                }
            }
        }

        return { modifiedCount };
    }

    private setNestedValue(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop();
        if (!lastKey) return;

        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);

        target[lastKey] = value;
    }

    private rowToGuildDocument(row: any): GuildDocument {
        return {
            _id: row.id,
            GuildSettings: JSON.parse(row.guild_settings),
            InactiveThreads: row.inactive_threads ? JSON.parse(row.inactive_threads) : [],
            SkulledMessages: row.skulled_messages ? JSON.parse(row.skulled_messages) : [],
            Tags: row.tags ? JSON.parse(row.tags) : [],
        } as GuildDocument;
    }

    private createDefaultGuild(guildId: Snowflake, overrides: Partial<GuildDocument> = {}): GuildDocument {
        return {
            _id: guildId,
            GuildSettings: {
                BulkDeleteLogging: {
                    BulkDelLoggingBoolean: false,
                    IgnoredLoggingChannels: [],
                    LogChannel: null,
                },
                Channels: {
                    AllowedSkullboardChannels: [],
                    AllowedSnipeChannels: [],
                    AllowedTagChannels: [],
                    AutomaticSlowmodeChannels: [],
                },
                InactiveThreads: {
                    graceTime: 1440,
                    warningCheck: false,
                    warningTime: 2880,
                },
                Roles: {
                    AllowedAdminRoles: [],
                    AllowedFunCommandRoles: [],
                    AllowedStaffRoles: [],
                    AllowedTagAdminRoles: [],
                    AllowedTagRoles: [],
                    IgnoredSnipedRoles: [],
                    SupportRoles: [],
                },
                Skullboard: {
                    SkullboardBoolean: false,
                    SkullboardChannel: null,
                    SkullboardEmoji: '💀',
                    SkullboardReactionThreshold: 4,
                },
                Text: {
                    Actions: [
                        'bonked', 'wacked', 'slapped', 'hit', 'jumped', 'smacked',
                        'spun', 'knocked', 'socked', 'thwacked', 'punched', 'fried',
                        'donked', 'kicked', 'tapped', 'struck'
                    ],
                    Objects: [
                        'a fish', 'a frying pan', 'a bat', 'a pancake', 'a toaster',
                        'a single fry', 'a chocolate bar', 'their bank balance',
                        'some glasses', 'a tomato', 'an apple', 'a couch', 'a bed',
                        'an egg', 'a harmonica'
                    ],
                    Topics: []
                },
                Users: {
                    IgnoreSnipedUsers: [],
                },
            },
            InactiveThreads: [],
            SkulledMessages: [],
            Tags: [],
            ...overrides,
        } as GuildDocument;
    }
}