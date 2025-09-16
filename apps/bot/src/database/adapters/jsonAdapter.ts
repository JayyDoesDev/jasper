import { Snowflake } from '@antibot/interactions';
import fs from 'fs/promises';
import path from 'path';
import { DatabaseAdapter, DatabaseConfig } from '../interfaces';
import { GuildDocument } from '../../models/guildSchema';

interface JsonData {
    guilds: Record<string, GuildDocument>;
}

export class JsonAdapter implements DatabaseAdapter {
    private connected = false;
    private filePath = '';
    private data: JsonData = { guilds: {} };

    async connect(config: DatabaseConfig): Promise<void> {
        if (!config.filePath) {
            throw new Error('JSON file path is required');
        }

        this.filePath = config.filePath;

        // Ensure directory exists
        const dir = path.dirname(this.filePath);
        await fs.mkdir(dir, { recursive: true });

        // Load existing data or create new file
        try {
            const fileContent = await fs.readFile(this.filePath, 'utf-8');
            this.data = JSON.parse(fileContent);
        } catch (error) {
            // File doesn't exist, create with empty data
            this.data = { guilds: {} };
            await this.saveData();
        }

        this.connected = true;
        console.log('JSON database connected');
    }

    async disconnect(): Promise<void> {
        if (this.connected) {
            await this.saveData();
        }
        this.connected = false;
        console.log('JSON database disconnected');
    }

    isConnected(): boolean {
        return this.connected;
    }

    private async saveData(): Promise<void> {
        await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    async findGuild(guildId: Snowflake): Promise<GuildDocument | null> {
        const guild = this.data.guilds[guildId];
        return guild || null;
    }

    async upsertGuild(guild: Partial<GuildDocument>): Promise<GuildDocument> {
        if (!guild._id) {
            throw new Error('Guild ID is required');
        }

        const existingGuild = this.data.guilds[guild._id];
        const updatedGuild = existingGuild 
            ? { ...existingGuild, ...guild }
            : this.createDefaultGuild(guild._id, guild);

        this.data.guilds[guild._id] = updatedGuild;
        await this.saveData();
        return updatedGuild;
    }

    async updateGuild(guildId: Snowflake, updates: Partial<GuildDocument>): Promise<GuildDocument | null> {
        const existingGuild = this.data.guilds[guildId];
        if (!existingGuild) {
            return null;
        }

        const updatedGuild = { ...existingGuild, ...updates };
        this.data.guilds[guildId] = updatedGuild;
        await this.saveData();
        return updatedGuild;
    }

    async deleteGuild(guildId: Snowflake): Promise<boolean> {
        if (this.data.guilds[guildId]) {
            delete this.data.guilds[guildId];
            await this.saveData();
            return true;
        }
        return false;
    }

    async query<T = any>(query: any): Promise<T> {
        // Simple query implementation for JSON
        const guilds = Object.values(this.data.guilds);
        
        if (query.$or) {
            // Handle $or queries (used in migrations)
            return guilds.filter(guild => {
                return query.$or.some((condition: any) => this.matchesCondition(guild, condition));
            }) as T;
        }
        
        return guilds.filter(guild => this.matchesQuery(guild, query)) as T;
    }

    private matchesCondition(guild: any, condition: any): boolean {
        for (const [key, value] of Object.entries(condition)) {
            if (key.includes('.')) {
                const nestedValue = this.getNestedValue(guild, key);
                if (value && typeof value === 'object') {
                    if (value.$exists !== undefined) {
                        const exists = nestedValue !== undefined && nestedValue !== null;
                        if (exists !== value.$exists) return false;
                    }
                    if (value.$eq !== undefined && nestedValue !== value.$eq) return false;
                    if (value.$size !== undefined && (!Array.isArray(nestedValue) || nestedValue.length !== value.$size)) return false;
                } else if (nestedValue !== value) {
                    return false;
                }
            }
        }
        return true;
    }

    private matchesQuery(guild: any, query: any): boolean {
        for (const [key, value] of Object.entries(query)) {
            if (key === '_id' && guild._id !== value) return false;
            // Add more query matching logic as needed
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
                if (update.$set) {
                    for (const [key, value] of Object.entries(update.$set)) {
                        this.setNestedValue(guild, key, value);
                    }
                    this.data.guilds[guild._id] = guild;
                    modifiedCount++;
                }
            }
        }

        if (modifiedCount > 0) {
            await this.saveData();
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