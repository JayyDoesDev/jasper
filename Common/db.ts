import GuildSchema from '../Models/GuildSchema';
import UserSchema from '../Models/UserSchema';
import { Snowflake } from '@antibot/interactions';
import { Context } from '../Source/Context';
import _ from 'lodash';
import { ConfigurationRoles, configurationRolesContainer } from './define';
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';
import { Options } from '../Services/SettingsService';
import { checkForRoles } from './roles';

export async function userExists(userId: Snowflake): Promise<boolean> {
    return (await UserSchema.findOne({ _id: userId })) ? true : false;
}

export async function guildExists(guildId: Snowflake): Promise<boolean> {
    return (await GuildSchema.findOne({ _id: guildId })) ? true : false;
}

export async function getGuild<R extends object>(ctx: Context, guildId: Snowflake): Promise<R> {
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

export async function withConfigurationRoles<
    Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
>(
    context: Context,
    interaction: Interaction,
    ...configurationRoles: ConfigurationRoles[]
): Promise<{
    noRolesWithConfig: (interaction: Interaction, code: Function) => void;
    noRolesNoConfig: (interaction: Interaction, code: Function) => void;
}> {
    let hasRolesWithConfig = false;
    let hasCheckedAnyRoles = false;
    let noConfiguredRoles = true;

    for (const role of configurationRoles) {
        for (const containerRole of configurationRolesContainer) {
            if (containerRole[0] === role) {
                hasCheckedAnyRoles = true;
                const settings = await context.services.settings.configure<Options>({
                    guildId: interaction.guild.id,
                });

                const roles = await settings.getRoles<Snowflake>(
                    interaction.guild.id,
                    containerRole[1],
                );

                if (roles?.length) {
                    noConfiguredRoles = false;
                    if (!checkForRoles(interaction, ...roles)) {
                        hasRolesWithConfig = true;
                    }
                }
            }
        }
    }

    return {
        noRolesWithConfig: (interaction: Interaction, code: (interaction: Interaction) => void) => {
            if (hasRolesWithConfig) {
                code(interaction);
            }
        },
        noRolesNoConfig: (interaction: Interaction, code: (interaction: Interaction) => void) => {
            if (hasCheckedAnyRoles && noConfiguredRoles) {
                code(interaction);
            }
        },
    };
}
