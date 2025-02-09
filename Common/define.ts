/* eslint @typescript-eslint/no-explicit-any: "off" */
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Interaction,
    MessageFlags,
    PermissionsBitField,
} from 'discord.js';
import { Context } from '../Source/Context';
import { ICommand, Snowflake } from '@antibot/interactions';
import { checkForRoles } from './roles';
import { withConfigurationRoles } from './db';

export enum ConfigurationRoles {
    SupportRoles,
    TagRoles,
    TagAdminRoles,
    AdminRoles,
    StaffRoles,
}

export const configurationRolesContainer = [
    [ConfigurationRoles.AdminRoles, 'AllowedAdminRoles'],
    [ConfigurationRoles.StaffRoles, 'AllowedStaffRoles'],
    [ConfigurationRoles.SupportRoles, 'SupportRoles'],
    [ConfigurationRoles.TagRoles, 'AllowedTagRoles'],
    [ConfigurationRoles.TagAdminRoles, 'AllowedTagAdminRoles'],
] as const;

export interface SubCommand {
    name: string;
    allowedRoles?: Snowflake[];
    useConfigRoles?: ConfigurationRoles[];
    permissions?: PermissionsBitField[] | any[];
    handler: (ctx: Context, interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => Promise<void>;
}

export interface Command<
    Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
> {
    command: ICommand;
    permissions?: PermissionsBitField[] | any[];
    useConfigRoles?: ConfigurationRoles[];
    on: (ctx: Context, interaction: Interaction) => void;
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => void;
    subCommands?: {
        [key: string]: SubCommand;
    };
}

export interface Event<
    T = Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction
        ? Interaction
        : unknown,
> {
    event: {
        name: string;
        once: boolean;
    };
    on: (event: T, ctx: Context) => void;
}

export type Plugin = {
    name: string;
    description: string;
    commands: Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>[];
    events?: Event[];
    public_plugin: boolean;
};

export const message = {
    content: "Sorry but you can't use this command.",
    flags: MessageFlags.Ephemeral,
} as any;

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

export function defineSubCommand(options: SubCommand): SubCommand {
    if (!options.name || !options.handler) {
        throw new Error('SubCommand must have name and handler');
    }
    return options;
}

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
                                return await interaction.reply(message);
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
                            return await interaction.reply(message);
                        }
                    }

                    if (options.subCommands[subCommandName].useConfigRoles?.length) {
                        const { noRolesWithConfig, noRolesNoConfig } = await withConfigurationRoles(
                            ctx,
                            interaction,
                            ...options.subCommands[subCommandName].useConfigRoles,
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
