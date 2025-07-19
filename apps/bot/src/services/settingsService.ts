import { Snowflake } from '@antibot/interactions';

import { Context } from '../classes/context';
import { getGuild } from '../db';
import GuildSchema, { GuildDocument, Settings } from '../models/guildSchema';
import { Nullable } from '../types';

import { CommonCondition, Service } from './service';

export interface GuildSettingsWithKey<T extends keyof Settings> extends GuildSnowflake {
    key: keyof Settings[T];
}

export interface GuildSnowflake {
    guildId: Snowflake;
}

export interface Options extends GuildSnowflake {
    GuildSettings?: Settings;
}

export interface SetActionOptions extends GuildSettingsWithKey<'Text'> {
    actions: string | string[];
}

export interface SetChannelOptions extends GuildSettingsWithKey<'Channels'> {
    channels: Snowflake | Snowflake[];
}


export interface SetObjectOptions extends GuildSettingsWithKey<'Text'> {
    objects: string | string[];

export interface SetInactiveThreadOptions extends GuildSettingsWithKey<'InactiveThreads'> {
    graceTime: number;
    warningCheck: boolean;
    warningTime: number;
}

export interface SetRoleOptions extends GuildSettingsWithKey<'Roles'> {
    roles: Snowflake | Snowflake[];
}

export interface SetSkullboardOptions extends GuildSnowflake {
    channel?: Snowflake;
    emoji?: string;
    threshold?: number;
}

export interface SetTopicOptions extends GuildSettingsWithKey<'Text'> {
    topics: string | string[];
}

export interface SetUsersOptions extends GuildSnowflake {
    users: Snowflake | Snowflake[];
}

class SettingsService extends Service {
    private guildId: Snowflake;
    private guildSettings: Settings;

    constructor(public ctx: Context) {
        super(ctx);
        this.guildId = '';
        this.guildSettings = {
            Channels: {
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
            Text: { Actions: [], Objects: [], Topics: []},
            Users: { IgnoreSnipedUsers: [] },
        };
    }

    public async configure<T>(config: T extends Options ? Options : null): Promise<this> {
        this.guildId = config?.guildId ?? '';
        if (config?.GuildSettings) {
            this.guildSettings = config.GuildSettings;
        }

        const {
            GuildSettings: { Channels, InactiveThreads, Roles, Skullboard, Text, Users },
        } = await getGuild<GuildDocument>(this.ctx, this.guildId);

        this.guildSettings = {
            Channels: {
                AllowedSnipeChannels: Channels.AllowedSnipeChannels,
                AllowedTagChannels: Channels.AllowedTagChannels,
                AutomaticSlowmodeChannels: Channels.AutomaticSlowmodeChannels,
            },
            InactiveThreads: {
                graceTime: InactiveThreads.graceTime,
                warningCheck: InactiveThreads.warningCheck,
                warningTime: InactiveThreads.warningTime,
            },
            Roles: {
                AllowedAdminRoles: Roles.AllowedAdminRoles,
                AllowedStaffRoles: Roles.AllowedStaffRoles,
                AllowedTagAdminRoles: Roles.AllowedTagAdminRoles,
                AllowedTagRoles: Roles.AllowedTagRoles,
                IgnoredSnipedRoles: Roles.IgnoredSnipedRoles,
                SupportRoles: Roles.SupportRoles,
            },
            Skullboard: {
                SkullboardBoolean: Skullboard.SkullboardBoolean,
                SkullboardChannel: Skullboard.SkullboardChannel,
                SkullboardEmoji: Skullboard.SkullboardEmoji ?? '💀',
                SkullboardReactionThreshold: Skullboard.SkullboardReactionThreshold,
            },
            Text: { Actions: Text.Actions, Objects: Text.Objects, Topics: Text.Topics },
            Users: { IgnoreSnipedUsers: Users.IgnoreSnipedUsers },
        };

        return this;
    }


    public async getActions<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Text'],
    ): Promise<CommonCondition<string[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get actions');
        return this.getFromSettings('Text', key, validatedGuildId);
    }

    public async getChannels<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Channels'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get channels');
        return this.getFromSettings('Channels', key, validatedGuildId);
    }


    public async getObjects<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Text'],
    ): Promise<CommonCondition<string[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get objects');
        return this.getFromSettings('Text', key, validatedGuildId);

    public async getInactiveThreads<T>(
        guildId: T extends Snowflake ? Snowflake : null,
    ): Promise<CommonCondition<Settings['InactiveThreads']>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get inactiveThreads');
        const guild = await getGuild<GuildDocument>(this.ctx, validatedGuildId);
        return guild.GuildSettings.InactiveThreads;
    }

    public async getRoles<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Roles'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get roles');
        return this.getFromSettings('Roles', key, validatedGuildId);
    }

    public getSettings(): CommonCondition<Settings> {
        return this.guildSettings;
    }

    public async getSkullboard<T>(
        guildId: T extends Snowflake ? Snowflake : null,
    ): Promise<CommonCondition<Settings['Skullboard']>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get skullboard');
        const guild = await getGuild<GuildDocument>(this.ctx, validatedGuildId);
        return guild.GuildSettings.Skullboard;
    }

    public async getTopics<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Text'],
    ): Promise<CommonCondition<string[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get topics');
        return this.getFromSettings('Text', key, validatedGuildId);
    }

    public async getUsers<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Users'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const validatedGuildId = this.validateGuildId(guildId, 'get users');
        return this.getFromSettings('Users', key, validatedGuildId);
    }


    public async removeActions<T>(
        options: T extends SetActionOptions ? SetActionOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove actions');
        const key = this.validateKey<'Text'>(options?.key, 'Action');
        return this.removeFromSettings('Text', key, guildId, options?.actions ?? []);
    }

    public async removeChannels<T>(
        options: T extends SetChannelOptions ? SetChannelOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove channels');
        const key = this.validateKey<'Channels'>(options?.key, 'Channel');
        return this.removeFromSettings('Channels', key, guildId, options?.channels ?? []);
    }


    public async removeObjects<T>(
        options: T extends SetObjectOptions ? SetObjectOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove objects');
        const key = this.validateKey<'Text'>(options?.key, 'Object');
        return this.removeFromSettings('Text', key, guildId, options?.objects ?? []);

    public async removeInactiveThreads<T>(
        options: T extends SetInactiveThreadOptions ? SetInactiveThreadOptions : null,
    ): Promise<CommonCondition<Settings['InactiveThreads']>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove inactiveThreads');
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        guild.GuildSettings.InactiveThreads.warningCheck = false;
        guild.GuildSettings.InactiveThreads.warningTime = 2880;
        guild.GuildSettings.InactiveThreads.graceTime = 1440;

        await this.ctx.store.setForeignKey({ guild: guildId }, guild);
        await GuildSchema.updateOne(
            { _id: guildId },
            { $set: { 'GuildSettings.InactiveThreads': guild.GuildSettings.InactiveThreads } },
            { upsert: true },
        );

        return guild.GuildSettings.InactiveThreads;
    }

    public async removeRoles<T>(
        options: T extends SetRoleOptions ? SetRoleOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove roles');
        const key = this.validateKey<'Roles'>(options?.key, 'Role');
        return this.removeFromSettings('Roles', key, guildId, options?.roles ?? []);
    }

    public async removeSkullboard<T>(
        options: T extends SetSkullboardOptions ? SetSkullboardOptions : null,
    ): Promise<CommonCondition<Settings['Skullboard']>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove skullboard');
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        guild.GuildSettings.Skullboard.SkullboardChannel = null;
        guild.GuildSettings.Skullboard.SkullboardEmoji = '💀';
        guild.GuildSettings.Skullboard.SkullboardReactionThreshold = 4;

        await this.ctx.store.setForeignKey({ guild: guildId }, guild);
        await GuildSchema.updateOne(
            { _id: guildId },
            {
                $set: {
                    'GuildSettings.Skullboard': guild.GuildSettings.Skullboard,
                },
            },
            { upsert: true },
        );

        return guild.GuildSettings.Skullboard;
    }

    public async removeTopics<T>(
        options: T extends SetTopicOptions ? SetTopicOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove topics');
        const key = this.validateKey<'Text'>(options?.key, 'Topic');
        return this.removeFromSettings('Text', key, guildId, options?.topics ?? []);
    }

    public async removeUsers<T>(
        options: T extends SetUsersOptions ? SetUsersOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'remove users');
        return this.removeFromSettings('Users', 'IgnoreSnipedUsers', guildId, options?.users ?? []);
    }

    public async setActions<T>(
        options: T extends SetActionOptions ? SetActionOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set actions');
        const key = this.validateKey<'Text'>(options?.key, 'Action');
        return this.updateSettings('Text', key, guildId, options?.actions ?? []);
    }

    public async setChannels<T>(
        options: T extends SetChannelOptions ? SetChannelOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set channels');
        const key = this.validateKey<'Channels'>(options?.key, 'Channel');
        return this.updateSettings('Channels', key, guildId, options?.channels ?? []);
    }


    public async setObjects<T>(
        options: T extends SetObjectOptions ? SetObjectOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set objects');
        const key = this.validateKey<'Text'>(options?.key, 'Object');
        return this.updateSettings('Text', key, guildId, options?.objects ?? []);
    }

    public async setInactiveThreads<T>(
        options: T extends SetInactiveThreadOptions ? SetInactiveThreadOptions : null,
    ): Promise<CommonCondition<Settings['InactiveThreads']>> {
        const guildId = this.validateGuildId(options?.guildId, 'set inactiveThreads');
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        if (options?.warningCheck !== undefined) {
            guild.GuildSettings.InactiveThreads.warningCheck = options.warningCheck;
        }

        if (options?.warningTime !== undefined) {
            guild.GuildSettings.InactiveThreads.warningTime = options.warningTime;
        }

        if (options?.graceTime !== undefined) {
            guild.GuildSettings.InactiveThreads.graceTime = options.graceTime;
        }

        await this.ctx.store.setForeignKey({ guild: guildId }, guild);
        await GuildSchema.updateOne(
            { _id: guildId },
            {
                $set: {
                    'GuildSettings.InactiveThreads': guild.GuildSettings.InactiveThreads,
                },
            },
            { upsert: true },
        );

        return guild.GuildSettings.InactiveThreads;
    }

    public async setRoles<T>(
        options: T extends SetRoleOptions ? SetRoleOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set roles');
        const key = this.validateKey<'Roles'>(options?.key, 'Role');
        return this.updateSettings('Roles', key, guildId, options?.roles ?? []);
    }

    public async setSkullboard<T>(
        options: T extends SetSkullboardOptions ? SetSkullboardOptions : null,
    ): Promise<CommonCondition<Settings['Skullboard']>> {
        const guildId = this.validateGuildId(options?.guildId, 'set skullboard');
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        if (options?.channel !== undefined) {
            guild.GuildSettings.Skullboard.SkullboardChannel = options.channel;
        }
        if (options?.emoji !== undefined) {
            guild.GuildSettings.Skullboard.SkullboardEmoji = options.emoji;
        }
        if (options?.threshold !== undefined) {
            guild.GuildSettings.Skullboard.SkullboardReactionThreshold = options.threshold;
        }

        await this.ctx.store.setForeignKey({ guild: guildId }, guild);
        await GuildSchema.updateOne(
            { _id: guildId },
            {
                $set: {
                    'GuildSettings.Skullboard': guild.GuildSettings.Skullboard,
                },
            },
            { upsert: true },
        );

        return guild.GuildSettings.Skullboard;
    }



    public async setTopics<T>(
        options: T extends SetTopicOptions ? SetTopicOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set topics');
        const key = this.validateKey<'Text'>(options?.key, 'Topic');
        return this.updateSettings('Text', key, guildId, options?.topics ?? []);

    }

    public async setUsers<T>(
        options: T extends SetUsersOptions ? SetUsersOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = this.validateGuildId(options?.guildId, 'set users');
        return this.updateSettings('Users', 'IgnoreSnipedUsers', guildId, options?.users ?? []);
    }

    private async getFromSettings<T extends keyof Settings, K extends keyof Settings[T]>(
        category: T,
        key: K,
        guildId: string,
    ): Promise<Settings[T][K]> {
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        return guild.GuildSettings[category][key] as Settings[T][K];
    }

    private async removeFromSettings<T extends keyof Settings, K extends keyof Settings[T]>(
        category: T,
        key: K,
        guildId: string,
        values: Settings[T][K] extends (infer U)[] ? U | U[] : Nullable<number | string>,
    ): Promise<Settings[T][K]> {
        const guild = await getGuild<GuildDocument>(this.ctx, guildId);
        const currentValues = guild.GuildSettings[category][key] as Settings[T][K];
        const valuesToRemove = (Array.isArray(values) ? values : [values]) as Settings[T][K];
        const updatedValues = (currentValues as Settings[T][K][]).filter(
            (value) => !(valuesToRemove as Settings[T][K][]).includes(value),
        ) as Settings[T][K];

        guild.GuildSettings[category][key] = updatedValues;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await GuildSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.${String(category)}.${String(key)}`]: updatedValues } },
        );

        return updatedValues;
    }

    private async updateSettings<T extends keyof Settings, K extends keyof Settings[T]>(
        category: T,
        key: K,
        guildId: string,
        values: Settings[T][K] extends (infer U)[] ? U | U[] : Nullable<number | string>,
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

        await GuildSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.${String(category)}.${String(key)}`]: updatedValues } },
            { upsert: true },
        );

        return updatedValues;
    }

    private validateGuildId(guildId: null | string, operation: string): string {
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
}

export default SettingsService;
