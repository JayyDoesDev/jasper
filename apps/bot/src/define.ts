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
import { ConfigurationChannels, ConfigurationRoles } from './container';
import { withConfiguration } from './db';
import { checkForRoles } from './roles';

export interface Command<
    Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
> {
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => void;
    command: ICommand;
    on: (ctx: Context, interaction: Interaction) => void;
    permissions?: PermissionResolvable[] | PermissionsBitField[];
    restrictToConfigChannels?: ConfigurationChannels[];
    restrictToConfigRoles?: ConfigurationRoles[];
    subCommands?: { [key: string]: SubCommand };
}

export interface Event<
    T = Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
        ? Interaction
        : unknown,
> {
    event: { name: string; once: boolean };
    on: (event: T, ctx: Context) => void;
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
    handler: (ctx: Context, interaction: ChatInputCommandInteraction) => Promise<void>;
    name: string;
    permissions?: PermissionResolvable[] | PermissionsBitField[];
    restrictToConfigChannels?: ConfigurationChannels[];
    restrictToConfigRoles?: ConfigurationRoles[];
}

export const message = {
    content: "Sorry but you can't use this command.",
    flags: MessageFlags.Ephemeral,
} as { content: string; flags: MessageFlags.Ephemeral };

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
                    if (options.subCommands[subCommandName].permissions) {
                        for (const permission of options.subCommands[subCommandName].permissions) {
                            if (!interaction.memberPermissions.has(permission)) {
                                return interaction.reply(message);
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
                            return interaction.reply(message);
                        }
                    }

                    if (options.subCommands[subCommandName].restrictToConfigRoles?.length) {
                        const { noRolesNoConfig, noRolesWithConfig } = await withConfiguration(
                            ctx,
                            interaction,
                            'roles',
                            ...options.subCommands[subCommandName].restrictToConfigRoles,
                        );

                        let configError = false;
                        noRolesWithConfig(interaction, () => {
                            configError = true;
                        });

                        noRolesNoConfig(interaction, () => {
                            message.content +=
                                ' Configuration of roles required. Please check with the server administrator.';
                            configError = true;
                        });

                        if (configError) {
                            await interaction.reply(message);
                            message.content = "Sorry but you can't use this command.";
                            return;
                        }
                    }

                    if (options.subCommands[subCommandName].restrictToConfigChannels?.length) {
                        const { noChannelsNoConfig, noChannelsWithConfig } =
                            await withConfiguration(
                                ctx,
                                interaction,
                                'channels',
                                ...options.subCommands[subCommandName].restrictToConfigChannels,
                            );

                        let configError = false;
                        noChannelsWithConfig(interaction, () => {
                            configError = true;
                        });

                        noChannelsNoConfig(interaction, () => {
                            message.content +=
                                ' Configuration of channels required. Please check with the server administrator.';
                            configError = true;
                        });

                        if (configError) {
                            await interaction.reply(message);
                            message.content = "Sorry but you can't use this command.";
                            return;
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
                if (interaction.isAutocomplete()) {
                    const subCommandName = interaction.options.getSubcommand(false);
                    if (subCommandName && options.subCommands?.[subCommandName]?.autocomplete) {
                        if (options.subCommands[subCommandName].permissions) {
                            for (const permission of options.subCommands[subCommandName]
                                .permissions) {
                                if (!interaction.memberPermissions.has(permission)) {
                                    await interaction.respond([]);
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
                                await interaction.respond([]);
                                return;
                            }
                        }

                        if (options.subCommands[subCommandName].restrictToConfigRoles?.length) {
                            const { noRolesNoConfig, noRolesWithConfig } = await withConfiguration(
                                ctx,
                                interaction,
                                'roles',
                                ...options.subCommands[subCommandName].restrictToConfigRoles,
                            );

                            let configError = false;
                            noRolesWithConfig(interaction, () => {
                                configError = true;
                            });

                            noRolesNoConfig(interaction, () => {
                                configError = true;
                            });

                            if (configError) {
                                await interaction.respond([]);
                                return;
                            }
                        }

                        await options.subCommands[subCommandName].autocomplete!(ctx, interaction);
                        return;
                    }
                    originalAutocomplete(ctx, interaction);
                }
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
