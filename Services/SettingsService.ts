import { Snowflake } from '@antibot/interactions';
import { Context } from '../Source/Context';
import { CommonCondition, Service } from './Service';
import TagSchema, { GuildDocument, Settings } from '../Models/GuildSchema';
import { getGuild } from '../Common/db';

export interface GuildSnowflake {
    guildId: Snowflake;
}

export interface SetUsersOptions extends GuildSnowflake {
    users: Snowflake | Snowflake[];
}

export interface GuildSettingsWithKey<T extends keyof Settings> extends GuildSnowflake {
    key: keyof Settings[T];
}

export interface Options extends GuildSnowflake {
    GuildSettings?: Settings;
}

export interface SetChannelOptions extends GuildSettingsWithKey<'Channels'> {
    channels: Snowflake | Snowflake[];
}

export interface SetRoleOptions extends GuildSettingsWithKey<'Roles'> {
    roles: Snowflake | Snowflake[];
}

export interface SetTopicOptions extends GuildSettingsWithKey<'Text'> {
    topics: string | string[];
}

class SettingsService extends Service {
    private guildId: Snowflake;
    private guildSettings: Settings;

    private validateGuildId(guildId: string | null, operation: string): string {
        const targetGuildId = guildId ?? this.guildId;
        if (!targetGuildId) {
            throw new Error(`GuildId is required to ${operation}`);
        }
        return targetGuildId;
    }

    private validateKey<T extends keyof Settings>(
        key: keyof Settings[T] | undefined,
        category: string,
    ): keyof Settings[T] {
        if (!key) {
            throw new Error(`${category} key is required`);
        }
        return key;
    }

    private async updateSettings<T extends keyof Settings, K extends keyof Settings[T]>(
        category: T,
        key: K,
        guildId: string,
        values: Settings[T][K] extends (infer U)[] ? U | U[] : never,
    ): Promise<Settings[T][K]> {
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const currentValues = guild.GuildSettings[category][key] as Settings[T][K];
        const valuesToAdd = (Array.isArray(values) ? values : [values]) as Settings[T][K];
        const updatedValues = [
            ...new Set([
                ...(currentValues as Settings[T][K][]),
                ...(valuesToAdd as Settings[T][K][]),
            ]),
        ] as Settings[T][K];

        guild.GuildSettings[category][key] = updatedValues;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.${String(category)}.${String(key)}`]: updatedValues } },
            { upsert: true },
        );

        return updatedValues;
    }

    private async removeFromSettings<T extends keyof Settings, K extends keyof Settings[T]>(
        category: T,
        key: K,
        guildId: string,
        values: Settings[T][K] extends (infer U)[] ? U | U[] : never,
    ): Promise<Settings[T][K]> {
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const currentValues = guild.GuildSettings[category][key] as Settings[T][K];
        const valuesToRemove = (Array.isArray(values) ? values : [values]) as Settings[T][K];
        const updatedValues = (currentValues as Settings[T][K][]).filter(
            (value) => !(valuesToRemove as Settings[T][K][]).includes(value),
        ) as Settings[T][K];

        guild.GuildSettings[category][key] = updatedValues;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.${String(category)}.${String(key)}`]: updatedValues } },
        );

        return updatedValues;
    }

    private async getFromSettings<T extends keyof Settings, K extends keyof Settings[T]>(
        category: T,
        key: K,
        guildId: string,
    ): Promise<Settings[T][K]> {
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        return guild.GuildSettings[category][key] as Settings[T][K];
    }

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = '';
        this.guildSettings = {
            Channels: {
                AllowedSnipeChannels: [],
                AllowedTagChannels: [],
                AutomaticSlowmodeChannels: [],
            },
            Roles: {
                SupportRoles: [],
                AllowedTagRoles: [],
                AllowedTagAdminRoles: [],
                AllowedAdminRoles: [],
                AllowedStaffRoles: [],
                IgnoredSnipedRoles: [],
            },
            Text: { Topics: [] },
            Users: { IgnoreSnipedUsers: [] },
        };
    }

    public async configure<T>(config: T extends Options ? Options : null): Promise<this> {
        this.guildId = config?.guildId ?? '';
        if (config?.GuildSettings) {
            this.guildSettings = config.GuildSettings;
        }

        const {
            GuildSettings: { Channels, Roles, Text, Users },
        } = await getGuild<GuildDocument>(this.ctx, this.guildId);

        this.guildSettings = {
            Channels: {
                AllowedSnipeChannels: Channels.AllowedSnipeChannels,
                AllowedTagChannels: Channels.AllowedTagChannels,
                AutomaticSlowmodeChannels: Channels.AutomaticSlowmodeChannels,
            },
            Roles: {
                SupportRoles: Roles.SupportRoles,
                AllowedTagRoles: Roles.AllowedTagRoles,
                AllowedTagAdminRoles: Roles.AllowedTagAdminRoles,
                AllowedAdminRoles: Roles.AllowedAdminRoles,
                AllowedStaffRoles: Roles.AllowedStaffRoles,
                IgnoredSnipedRoles: Roles.IgnoredSnipedRoles,
            },
            Text: { Topics: Text.Topics },
            Users: { IgnoreSnipedUsers: Users.IgnoreSnipedUsers },
        };

        return this;
    }

    public getSettings(): CommonCondition<Settings> {
        return this.guildSettings;
    }

    public async setChannels<T>(
        options: T extends SetChannelOptions ? SetChannelOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set channels');
        const key = this.validateKey<'Channels'>(options?.key, 'Channel');
        return this.updateSettings('Channels', key, guildId, options?.channels ?? []);
    }

    public async removeChannels<T>(
        options: T extends SetChannelOptions ? SetChannelOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove channels');
        const key = this.validateKey<'Channels'>(options?.key, 'Channel');
        return this.removeFromSettings('Channels', key, guildId, options?.channels ?? []);
    }

    public async getChannels<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Channels'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get channels');
        return this.getFromSettings('Channels', key, validatedGuildId);
    }

    public async setRoles<T>(
        options: T extends SetRoleOptions ? SetRoleOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set roles');
        const key = this.validateKey<'Roles'>(options?.key, 'Role');
        return this.updateSettings('Roles', key, guildId, options?.roles ?? []);
    }

    public async removeRoles<T>(
        options: T extends SetRoleOptions ? SetRoleOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove roles');
        const key = this.validateKey<'Roles'>(options?.key, 'Role');
        return this.removeFromSettings('Roles', key, guildId, options?.roles ?? []);
    }

    public async getRoles<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Roles'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get roles');
        return this.getFromSettings('Roles', key, validatedGuildId);
    }

    public async setTopics<T>(
        options: T extends SetTopicOptions ? SetTopicOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set topics');
        const key = this.validateKey<'Text'>(options?.key, 'Topic');
        return this.updateSettings('Text', key, guildId, options?.topics ?? []);
    }

    public async removeTopics<T>(
        options: T extends SetTopicOptions ? SetTopicOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove topics');
        const key = this.validateKey<'Text'>(options?.key, 'Topic');
        return this.removeFromSettings('Text', key, guildId, options?.topics ?? []);
    }

    public async getTopics<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Text'],
    ): Promise<CommonCondition<string[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get topics');
        return this.getFromSettings('Text', key, validatedGuildId);
    }

    public async setUsers<T>(
        options: T extends SetUsersOptions ? SetUsersOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set users');
        return this.updateSettings('Users', 'IgnoreSnipedUsers', guildId, options?.users ?? []);
    }

    public async removeUsers<T>(
        options: T extends SetUsersOptions ? SetUsersOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove users');
        return this.removeFromSettings('Users', 'IgnoreSnipedUsers', guildId, options?.users ?? []);
    }

    public async getUsers<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Users'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get users');
        return this.getFromSettings('Users', key, validatedGuildId);
    }
}

export default SettingsService;
