import { Snowflake } from '@antibot/interactions';
import { Context } from '../Source/Context';
import { CommonCondition, Service } from './Service';
import TagSchema, { GuildDocument, Settings } from '../Models/GuildSchema';
import { getGuild } from '../Common/db';

export type GuildSnowflake = {
    guildId: Snowflake;
};

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
            },
            Text: { Topics: [] },
        };
    }

    public async configure<T>(config: T extends Options ? Options : null): Promise<this> {
        this.guildId = config?.guildId ?? '';
        if (config?.GuildSettings) {
            this.guildSettings = config.GuildSettings;
        }

        const {
            GuildSettings: { Channels, Roles, Text },
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
            },
            Text: { Topics: Text.Topics },
        };

        return this;
    }

    public getSettings(): CommonCondition<Settings> {
        return this.guildSettings;
    }

    public async setChannels<T>(
        options: T extends SetChannelOptions ? SetChannelOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = options?.guildId ?? this.guildId;
        const channels = options?.channels ?? [];
        const key = options?.key;

        if (!guildId) {
            throw new Error('GuildId is required to set channels');
        }

        if (!key) {
            throw new Error('Channel key is required');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const channelsToAdd = Array.isArray(channels) ? channels : [channels];

        const currentChannels = guild.GuildSettings.Channels[key];
        const updatedChannels = [...new Set([...currentChannels, ...channelsToAdd])];

        guild.GuildSettings.Channels[key] = updatedChannels;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.Channels.${key}`]: updatedChannels } },
            { upsert: true },
        );

        return updatedChannels;
    }

    public async removeChannels<T>(
        options: T extends SetChannelOptions ? SetChannelOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = options?.guildId ?? this.guildId;
        const channels = options?.channels ?? [];
        const key = options?.key;

        if (!guildId) {
            throw new Error('GuildId is required to remove channels');
        }

        if (!key) {
            throw new Error('Channel key is required');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const channelsToRemove = Array.isArray(channels) ? channels : [channels];

        const currentChannels = guild.GuildSettings.Channels[key];
        const updatedChannels = currentChannels.filter(
            (channel) => !channelsToRemove.includes(channel),
        );

        guild.GuildSettings.Channels[key] = updatedChannels;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.Channels.${key}`]: updatedChannels } },
        );

        return updatedChannels;
    }

    public async getChannels<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Channels'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const targetGuildId = guildId ?? this.guildId;

        if (!targetGuildId) {
            throw new Error('GuildId is required to get channels');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, targetGuildId);
        return guild.GuildSettings.Channels[key];
    }

    public async setRoles<T>(
        options: T extends SetRoleOptions ? SetRoleOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = options?.guildId ?? this.guildId;
        const roles = options?.roles ?? [];
        const key = options?.key;

        if (!guildId) {
            throw new Error('GuildId is required to set roles');
        }

        if (!key) {
            throw new Error('Role key is required');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const rolesToAdd = Array.isArray(roles) ? roles : [roles];

        const currentRoles = guild.GuildSettings.Roles[key];
        const updatedRoles = [...new Set([...currentRoles, ...rolesToAdd])];

        guild.GuildSettings.Roles[key] = updatedRoles;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.Roles.${key}`]: updatedRoles } },
            { upsert: true },
        );

        return updatedRoles;
    }

    public async removeRoles<T>(
        options: T extends SetRoleOptions ? SetRoleOptions : null,
    ): Promise<CommonCondition<Snowflake[]>> {
        const guildId = options?.guildId ?? this.guildId;
        const roles = options?.roles ?? [];
        const key = options?.key;

        if (!guildId) {
            throw new Error('GuildId is required to remove roles');
        }

        if (!key) {
            throw new Error('Role key is required');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const rolesToRemove = Array.isArray(roles) ? roles : [roles];

        const currentRoles = guild.GuildSettings.Roles[key];
        const updatedRoles = currentRoles.filter((role) => !rolesToRemove.includes(role));

        guild.GuildSettings.Roles[key] = updatedRoles;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.Roles.${key}`]: updatedRoles } },
        );

        return updatedRoles;
    }

    public async getRoles<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Roles'],
    ): Promise<CommonCondition<Snowflake[]>> {
        const targetGuildId = guildId ?? this.guildId;

        if (!targetGuildId) {
            throw new Error('GuildId is required to get roles');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, targetGuildId);
        return guild.GuildSettings.Roles[key];
    }

    public async setTopics<T>(
        options: T extends SetTopicOptions ? SetTopicOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = options?.guildId ?? this.guildId;
        const topics = options?.topics ?? [];
        const key = options?.key;

        if (!guildId) {
            throw new Error('GuildId is required to set topics');
        }

        if (!key) {
            throw new Error('Topic key is required');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const topicsToAdd = Array.isArray(topics) ? topics : [topics];

        const currentTopics = guild.GuildSettings.Text[key];
        const updatedTopics = [...new Set([...currentTopics, ...topicsToAdd])];

        guild.GuildSettings.Text[key] = updatedTopics;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.Text.${key}`]: updatedTopics } },
            { upsert: true },
        );

        return updatedTopics;
    }

    public async removeTopics<T>(
        options: T extends SetTopicOptions ? SetTopicOptions : null,
    ): Promise<CommonCondition<string[]>> {
        const guildId = options?.guildId ?? this.guildId;
        const topics = options?.topics ?? [];
        const key = options?.key;

        if (!guildId) {
            throw new Error('GuildId is required to remove topics');
        }

        if (!key) {
            throw new Error('Topic key is required');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, guildId);

        const topicsToRemove = Array.isArray(topics) ? topics : [topics];

        const currentTopics = guild.GuildSettings.Text[key];
        const updatedTopics = currentTopics.filter((topic) => !topicsToRemove.includes(topic));

        guild.GuildSettings.Text[key] = updatedTopics;
        await this.ctx.store.setForeignKey({ guild: guildId }, guild);

        await TagSchema.updateOne(
            { _id: guildId },
            { $set: { [`GuildSettings.Text.${key}`]: updatedTopics } },
        );

        return updatedTopics;
    }

    public async getTopics<T>(
        guildId: T extends Snowflake ? Snowflake : null,
        key: keyof Settings['Text'],
    ): Promise<CommonCondition<string[]>> {
        const targetGuildId = guildId ?? this.guildId;

        if (!targetGuildId) {
            throw new Error('GuildId is required to get topics');
        }

        const guild = await getGuild<GuildDocument>(this.ctx, targetGuildId);
        return guild.GuildSettings.Text[key];
    }
}

export default SettingsService;
