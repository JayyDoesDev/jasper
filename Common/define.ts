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
import { Options } from '../Services/SettingsService';

export enum ConfigurationRoles {
    SupportRoles,
    TagRoles,
    TagAdminRoles,
    AdminRoles,
    StaffRoles,
}

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
                    const message = {
                        content: "Sorry but you can't use this command.",
                        flags: MessageFlags.Ephemeral,
                    } as any;

                    if (options.subCommands[subCommandName].permissions) {
                        for (const permission of options.subCommands[subCommandName].permissions) {
                            if (!interaction.memberPermissions.has(permission)) {
                                await interaction.reply(message);
                                return;
                            }
                        }
                    }

                    if (options.subCommands[subCommandName].useConfigRoles?.length) {
                        const settings = await ctx.services.settings.configure<Options>({
                            guildId: interaction.guildId,
                        });

                        console.log(settings);

                        for (const role of options.subCommands[subCommandName].useConfigRoles) {
                            let roles: Snowflake[] | null = null;

                            switch (role) {
                                case ConfigurationRoles.AdminRoles:
                                    roles = await settings.getRoles<Snowflake>(
                                        interaction.guildId,
                                        'AllowedAdminRoles',
                                    );
                                    break;
                                case ConfigurationRoles.StaffRoles:
                                    roles = await settings.getRoles<Snowflake>(
                                        interaction.guildId,
                                        'AllowedStaffRoles',
                                    );
                                    break;
                                case ConfigurationRoles.SupportRoles:
                                    roles = await settings.getRoles<Snowflake>(
                                        interaction.guildId,
                                        'SupportRoles',
                                    );
                                    break;
                                case ConfigurationRoles.TagRoles:
                                    roles = await settings.getRoles<Snowflake>(
                                        interaction.guildId,
                                        'AllowedTagRoles',
                                    );
                                    break;
                                case ConfigurationRoles.TagAdminRoles:
                                    roles = await settings.getRoles<Snowflake>(
                                        interaction.guildId,
                                        'AllowedTagAdminRoles',
                                    );
                                    break;
                            }

                            if (roles?.length && !checkForRoles(interaction, ...roles)) {
                                await interaction.reply(message);
                                return;
                            }

                            if (!roles?.length) {
                                message.content =
                                    message.content +
                                    ' Configuration of roles required. Please check with the server administrator.';
                                await interaction.reply(message);
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
                            await interaction.reply(message);
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
