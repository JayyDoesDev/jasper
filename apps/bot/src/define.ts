/* eslint @typescript-eslint/no-explicit-any: "off" */
import { ICommand, Snowflake } from '@antibot/interactions';
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Interaction,
    MessageFlags,
    PermissionResolvable,
    PermissionsBitField,
} from 'discord.js';

import { Context } from './classes/context';
import {
    ConfigurationChannels,
    configurationChannelsContainer,
    ConfigurationRoles,
    configurationRolesContainer,
} from './container';
import { withConfiguration } from './db';
import { checkForRoles } from './roles';
import { safeAutocompleteRespond, safeDeferReply, safeReply } from './utils/interactionSafeguards';

export interface Command<
    Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
> {
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => void;
    command: ICommand;
    deferral?: DeferralOptions;
    on: (ctx: Context, interaction: Interaction) => void;
    permissions?: PermissionResolvable[] | PermissionsBitField[];
    restrictToConfigChannels?: ConfigurationChannels[];
    restrictToConfigRoles?: ConfigurationRoles[];
    subCommands?: { [key: string]: SubCommand };
}

// Deferral system types
export interface DeferralOptions {
    defer: boolean;
    ephemeral: boolean;
}

export interface Event<
    T = Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
        ? Interaction
        : unknown,
> {
    event: { name: string; once: boolean };
    on: (event: T, ctx: Context, ...args: any[]) => void;
}

export type Plugin = {
    commands: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[];
    description: string;
    events?: Event[];
    name: string;
    public_plugin: boolean;
};

export interface SubCommand {
    allowedRoles?: Snowflake[];
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => Promise<void>;
    deferral?: DeferralOptions;
    handler: (ctx: Context, interaction: ChatInputCommandInteraction) => Promise<void>;
    name: string;
    permissions?: PermissionResolvable[] | PermissionsBitField[];
    restrictToConfigChannels?: ConfigurationChannels[];
    restrictToConfigRoles?: ConfigurationRoles[];
}

export const message = {
    content: "Sorry but you can't use this command.",
    flags: MessageFlags.Ephemeral,
} as const;

export function defineCommand<
    Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
>(options: Command<Interaction>): Command<Interaction> {
    if (!isCommand(options)) throw new Error('Invalid Command options');

    if (options.subCommands) {
        const originalOn = options.on;
        const originalAutocomplete = options.autocomplete;
        options.on = async (ctx: Context, interaction: Interaction) => {
            if (interaction instanceof ChatInputCommandInteraction) {
                const subCommandName = interaction.options.getSubcommand(false);
                if (subCommandName && options.subCommands?.[subCommandName]) {
                    // Only defer if subcommand requests deferral
                    if (options.subCommands[subCommandName].deferral?.defer) {
                        await handleInteractionDeferral(
                            interaction,
                            options.subCommands[subCommandName].deferral,
                            `${interaction.commandName}/${subCommandName}`,
                        );
                    }
                    if (options.subCommands[subCommandName].permissions) {
                        for (const permission of options.subCommands[subCommandName].permissions) {
                            if (!interaction.memberPermissions.has(permission)) {
                                await safeReply(interaction, message);
                                return;
                            }
                        }
                    }

                    if (options.subCommands[subCommandName].allowedRoles) {
                        if (
                            !checkForRoles(
                                interaction,
                                ...options.subCommands[subCommandName].allowedRoles,
                            )
                        ) {
                            await safeReply(interaction, message);
                            return;
                        }
                    }

                    // Skip DB-backed configuration checks when subcommand needs immediate response (e.g., modal)
                    let shouldSkipConfigChecks = false;
                    if (options.subCommands[subCommandName].deferral?.defer === false) {
                        try {
                            const hasCachedGuild = await ctx.store.findGuild({
                                guild: interaction.guild.id,
                            });
                            shouldSkipConfigChecks = !hasCachedGuild;
                        } catch {
                            shouldSkipConfigChecks = true;
                        }
                    }

                    if (options.subCommands[subCommandName].restrictToConfigRoles?.length) {
                        const isModalFirst =
                            options.subCommands[subCommandName].deferral?.defer === false;
                        let handled = false;
                        if (isModalFirst && !shouldSkipConfigChecks) {
                            // Fast path using cached guild settings only
                            try {
                                const guildData: any = await ctx.store.getGuild({
                                    guild: interaction.guild.id,
                                });
                                const roleConfigKeys = options.subCommands[
                                    subCommandName
                                ].restrictToConfigRoles
                                    .map((req) => {
                                        return (configurationRolesContainer.find(
                                            (t) => t[0] === req,
                                        ) || [null, null])[1];
                                    })
                                    .filter(Boolean) as string[];
                                const configuredArrays = roleConfigKeys.map(
                                    (k) => guildData?.GuildSettings?.Roles?.[k] ?? [],
                                );
                                const hasAnyConfigured = configuredArrays.some(
                                    (arr: string[]) => arr.length > 0,
                                );
                                let allowed = false;
                                for (const arr of configuredArrays) {
                                    if (arr.length && checkForRoles(interaction, ...arr)) {
                                        allowed = true;
                                        break;
                                    }
                                }

                                if (!hasAnyConfigured) {
                                    const content =
                                        "Sorry but you can't use this command." +
                                        ' Configuration of roles required. Please check with the server administrator.';
                                    await safeReply(interaction, {
                                        content,
                                        flags: MessageFlags.Ephemeral,
                                    });
                                    return;
                                }

                                if (!allowed) {
                                    await safeReply(interaction, message);
                                    return;
                                }
                                handled = true;
                            } catch {}
                        }

                        if (!handled && !shouldSkipConfigChecks) {
                            const { noRolesNoConfig, noRolesWithConfig } = await withConfiguration(
                                ctx,
                                interaction,
                                'roles',
                                ...options.subCommands[subCommandName].restrictToConfigRoles,
                            );

                            let configError = false;
                            let suffix = '';
                            noRolesWithConfig(interaction, () => {
                                configError = true;
                            });

                            noRolesNoConfig(interaction, () => {
                                suffix =
                                    ' Configuration of roles required. Please check with the server administrator.';
                                configError = true;
                            });

                            if (configError) {
                                const content = "Sorry but you can't use this command." + suffix;
                                await safeReply(interaction, {
                                    content,
                                    flags: MessageFlags.Ephemeral,
                                });
                                return;
                            }
                        }
                    }

                    if (options.subCommands[subCommandName].restrictToConfigChannels?.length) {
                        const isModalFirst =
                            options.subCommands[subCommandName].deferral?.defer === false;
                        let handled = false;
                        if (isModalFirst && !shouldSkipConfigChecks) {
                            try {
                                const guildData: any = await ctx.store.getGuild({
                                    guild: interaction.guild.id,
                                });
                                const chanConfigKeys = options.subCommands[
                                    subCommandName
                                ].restrictToConfigChannels
                                    .map((req) => {
                                        return (configurationChannelsContainer.find(
                                            (t) => t[0] === req,
                                        ) || [null, null])[1];
                                    })
                                    .filter(Boolean) as string[];
                                const configuredArrays = chanConfigKeys.map(
                                    (k) => guildData?.GuildSettings?.Channels?.[k] ?? [],
                                );
                                const hasAnyConfigured = configuredArrays.some(
                                    (arr: string[]) => arr.length > 0,
                                );
                                const channelIdToCheck = interaction.channel.isThread()
                                    ? interaction.channel.parentId
                                    : interaction.channel.id;
                                let allowed = false;
                                for (const arr of configuredArrays) {
                                    if (arr.length && arr.includes(channelIdToCheck)) {
                                        allowed = true;
                                        break;
                                    }
                                }

                                if (!hasAnyConfigured) {
                                    const content =
                                        "Sorry but you can't use this command." +
                                        ' Configuration of channels required. Please check with the server administrator.';
                                    await safeReply(interaction, {
                                        content,
                                        flags: MessageFlags.Ephemeral,
                                    });
                                    return;
                                }

                                if (!allowed) {
                                    await safeReply(interaction, message);
                                    return;
                                }
                                handled = true;
                            } catch {}
                        }

                        if (!handled && !shouldSkipConfigChecks) {
                            const { noChannelsNoConfig, noChannelsWithConfig } =
                                await withConfiguration(
                                    ctx,
                                    interaction,
                                    'channels',
                                    ...options.subCommands[subCommandName].restrictToConfigChannels,
                                );

                            let configError = false;
                            let suffix = '';
                            noChannelsWithConfig(interaction, () => {
                                configError = true;
                            });

                            noChannelsNoConfig(interaction, () => {
                                suffix =
                                    ' Configuration of channels required. Please check with the server administrator.';
                                configError = true;
                            });

                            if (configError) {
                                const content = "Sorry but you can't use this command." + suffix;
                                await safeReply(interaction, {
                                    content,
                                    flags: MessageFlags.Ephemeral,
                                });
                                return;
                            }
                        }
                    }

                    await options.subCommands[subCommandName].handler(ctx, interaction);
                    return;
                }
            }
            originalOn(ctx, interaction);
        };

        if (originalAutocomplete) {
            options.autocomplete = async (ctx: Context, interaction: AutocompleteInteraction) => {
                if (!interaction.isAutocomplete()) return;

                const subCommandName = interaction.options.getSubcommand(false);
                if (!(subCommandName && options.subCommands?.[subCommandName]?.autocomplete)) {
                    return originalAutocomplete(ctx, interaction);
                }

                if (options.subCommands[subCommandName].permissions) {
                    for (const permission of options.subCommands[subCommandName].permissions) {
                        if (!interaction.memberPermissions.has(permission)) {
                            await safeAutocompleteRespond(interaction, []);
                            return;
                        }
                    }
                }

                if (options.subCommands[subCommandName].allowedRoles) {
                    if (
                        !checkForRoles(
                            interaction,
                            ...options.subCommands[subCommandName].allowedRoles,
                        )
                    ) {
                        await safeAutocompleteRespond(interaction, []);
                        return;
                    }
                }

                try {
                    const guildData: any = await ctx.store.getGuild({
                        guild: interaction.guild.id,
                    });
                    if (guildData) {
                        if (options.subCommands[subCommandName].restrictToConfigRoles?.length) {
                            const keys = options.subCommands[subCommandName].restrictToConfigRoles
                                .map((req) => {
                                    return (configurationRolesContainer.find(
                                        (t) => t[0] === req,
                                    ) || [null, null])[1];
                                })
                                .filter(Boolean) as string[];
                            const configuredArrays = keys.map(
                                (k) => guildData?.GuildSettings?.Roles?.[k] ?? [],
                            );
                            const hasAnyConfigured = configuredArrays.some(
                                (arr: string[]) => arr.length > 0,
                            );
                            let allowed = false;
                            for (const arr of configuredArrays) {
                                if (arr.length && checkForRoles(interaction, ...arr)) {
                                    allowed = true;
                                    break;
                                }
                            }
                            if (!hasAnyConfigured || !allowed) {
                                await safeAutocompleteRespond(interaction, []);
                                return;
                            }
                        }

                        if (options.subCommands[subCommandName].restrictToConfigChannels?.length) {
                            const keys = options.subCommands[
                                subCommandName
                            ].restrictToConfigChannels
                                .map((req) => {
                                    return (configurationChannelsContainer.find(
                                        (t) => t[0] === req,
                                    ) || [null, null])[1];
                                })
                                .filter(Boolean) as string[];
                            const configuredArrays = keys.map(
                                (k) => guildData?.GuildSettings?.Channels?.[k] ?? [],
                            );
                            const hasAnyConfigured = configuredArrays.some(
                                (arr: string[]) => arr.length > 0,
                            );
                            const channelIdToCheck = interaction.channel.isThread()
                                ? interaction.channel.parentId
                                : interaction.channel.id;
                            let allowed = false;
                            for (const arr of configuredArrays) {
                                if (arr.length && arr.includes(channelIdToCheck)) {
                                    allowed = true;
                                    break;
                                }
                            }
                            if (!hasAnyConfigured || !allowed) {
                                await safeAutocompleteRespond(interaction, []);
                                return;
                            }
                        }
                    }
                } catch {}

                await options.subCommands[subCommandName].autocomplete!(ctx, interaction);
            };
        }
    }

    return options;
}

export function defineEvent<T>(options: Event<T>): Event<T> {
    if (isEvent(options)) return options;
    throw new Error('Invalid Event options');
}

export function definePlugin(options: Plugin): Plugin {
    if (isPlugin(options)) return options;
    throw new Error('Invalid Plugin options');
}

export function defineSubCommand(options: SubCommand): SubCommand {
    if (!options.name || !options.handler) {
        throw new Error('SubCommand must have name and handler');
    }
    return options;
}

export async function handleInteractionDeferral(
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
    deferralOptions: DeferralOptions | undefined,
    commandName: string,
): Promise<void> {
    if (!deferralOptions?.defer) {
        return;
    }

    if (interaction.replied || interaction.deferred) {
        return;
    }

    try {
        await safeDeferReply(interaction, { ephemeral: deferralOptions.ephemeral });
    } catch (error) {
        console.error(`[DEFERRAL] Failed to defer interaction for command: ${commandName}`, error);
    }
}

function isCommand<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction>(
    options: unknown,
): options is Command<Interaction> {
    return (
        typeof options === 'object' && options !== null && 'command' in options && 'on' in options
    );
}

function isEvent<T>(options: unknown): options is Event<T> {
    return typeof options === 'object' && options !== null && 'event' in options && 'on' in options;
}

function isPlugin(options: unknown): options is Plugin {
    return (
        typeof options === 'object' &&
        options !== null &&
        'name' in options &&
        'commands' in options
    );
}
