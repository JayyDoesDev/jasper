import { Snowflake } from '@antibot/interactions';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
} from 'discord.js';
import _ from 'lodash';

import { Context } from './classes/context';
import {
    ConfigurationChannels,
    configurationChannelsContainer,
    ConfigurationRoles,
    configurationRolesContainer,
} from './container';
import GuildSchema from './models/guildSchema';
import UserSchema from './models/userSchema';
import { checkForRoles } from './roles';
import { Options } from './services/settingsService';

type ConfigReturn<Interaction, Key extends 'channels' | 'roles'> = Key extends 'roles'
    ? ConfigurationRoleFunctions<Interaction>
    : ConfigurationChannelFunctions<Interaction>;

type ConfigurationChannelFunctions<Interaction> = {
    noChannelsNoConfig: (interaction: Interaction, code: Function) => void;
    noChannelsWithConfig: (interaction: Interaction, code: Function) => void;
};

type ConfigurationRoleFunctions<Interaction> = {
    noRolesNoConfig: (interaction: Interaction, code: Function) => void;
    noRolesWithConfig: (interaction: Interaction, code: Function) => void;
};

export async function getGuild<R extends object>(ctx: Context, guildId: Snowflake): Promise<R> {
    const guildInCache = await ctx.store.findGuild({ guild: guildId });

    if (!guildInCache) {
        try {
            const guildInDb = await GuildSchema.findOne({ _id: guildId });

            if (guildInDb) {
                ctx.store.setForeignKey({ guild: guildId }, guildInDb);
                return <R>guildInDb;
            } else {
                const newGuild = new GuildSchema({
                    _id: guildId,
                    GuildSettings: {
                        Channels: {
                            AllowedSnipeChannels: [],
                            AllowedTagChannels: [],
                            AutomaticSlowmodeChannels: [],
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
                            SkullboardChannel: null,
                            SkullboardEmoji: '💀',
                            SkullboardReactionThreshold: 4,
                        },
                        Text: { Topics: [] },
                        Users: { IgnoreSnipedUsers: [] },
                    },
                    InactiveThreads: [],
                    Tags: [],
                });
                await newGuild.save();

                ctx.store.setForeignKey({ guild: guildId }, newGuild);

                return <R>newGuild;
            }
        } catch (error) {
            console.error('Error trying to find or create a guild', error);
        }
    } else {
        const guildInDb = await GuildSchema.findOne({ _id: guildId });
        if (guildInDb && !_.isEqual(guildInCache, guildInDb)) {
            ctx.store.setForeignKey({ guild: guildId }, guildInDb);
        }

        return ctx.store.getGuild({ guild: guildId });
    }
}

export async function guildExists(guildId: Snowflake): Promise<boolean> {
    return (await GuildSchema.findOne({ _id: guildId })) ? true : false;
}

export async function userExists(userId: Snowflake): Promise<boolean> {
    return (await UserSchema.findOne({ _id: userId })) ? true : false;
}

export async function withConfiguration<
    Interaction extends
        | AutocompleteInteraction
        | ChatInputCommandInteraction
        | ContextMenuCommandInteraction,
    Key extends 'channels' | 'roles',
>(
    context: Context,
    interaction: Interaction,
    key: Key,
    ...configuration: Key extends 'roles' ? ConfigurationRoles[] : ConfigurationChannels[]
): Promise<Partial<ConfigReturn<Interaction, Key>>> {
    let hasCheckAny = false;
    let notConfigured = true;
    let hasAny = false;
    let hasWithConfig = false;
    let config: Partial<ConfigReturn<Interaction, Key>> = {};
    if (key === 'roles') {
        for (const role of configuration) {
            for (const containerRole of configurationRolesContainer) {
                if (containerRole[0] === role) {
                    hasCheckAny = true;
                    const settings = await context.services.settings.configure<Options>({
                        guildId: interaction.guild.id,
                    });

                    const roles = await settings.getRoles<Snowflake>(
                        interaction.guild.id,
                        containerRole[1],
                    );

                    if (roles?.length) {
                        notConfigured = false;
                        if (checkForRoles(interaction, ...roles)) {
                            hasAny = true;
                        }
                    }
                }
            }
        }

        hasWithConfig = !hasAny && !notConfigured;
        config = {
            noRolesNoConfig: (
                interaction: Interaction,
                code: (interaction: Interaction) => void,
            ) => {
                if (hasCheckAny && notConfigured) {
                    code(interaction);
                }
            },
            noRolesWithConfig: (
                interaction: Interaction,
                code: (interaction: Interaction) => void,
            ) => {
                if (hasWithConfig) {
                    code(interaction);
                }
            },
        } as Partial<ConfigurationRoleFunctions<Interaction>> as Partial<
            ConfigReturn<Interaction, Key>
        >;
    } else if (key === 'channels') {
        for (const channel of configuration) {
            for (const containerChannel of configurationChannelsContainer) {
                if (containerChannel[0] === channel) {
                    hasCheckAny = true;
                    const settings = await context.services.settings.configure<Options>({
                        guildId: interaction.guild.id,
                    });

                    const channels = await settings.getChannels<Snowflake>(
                        interaction.guild.id,
                        containerChannel[1],
                    );

                    if (channels?.length) {
                        notConfigured = false;
                        for (const dbChannel of channels) {
                            if (interaction.channel.id === dbChannel) {
                                hasAny = true;
                            }
                        }
                    }
                }
            }
        }

        hasWithConfig = !hasAny && !notConfigured;
        config = {
            noChannelsNoConfig: (
                interaction: Interaction,
                code: (interaction: Interaction) => void,
            ) => {
                if (hasCheckAny && notConfigured) {
                    code(interaction);
                }
            },
            noChannelsWithConfig: (
                interaction: Interaction,
                code: (interaction: Interaction) => void,
            ) => {
                if (hasWithConfig) {
                    code(interaction);
                }
            },
        } as Partial<ConfigurationChannelFunctions<Interaction>> as Partial<
            ConfigReturn<Interaction, Key>
        >;
    }
    return config;
}
