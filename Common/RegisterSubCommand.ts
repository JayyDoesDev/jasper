import { Context } from "../Source/Context";
import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction, InteractionResponse } from "discord.js";

interface RegisterSubCommandOptions<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction> {
    subCommand: string;
    ctx: Context;
    interaction: Interaction | AutocompleteInteraction;
    callback: (ctx: Context, interaction: Interaction) => Promise<InteractionResponse | void>;
    autocomplete?: (ctx: Context, interaction: AutocompleteInteraction) => Promise<InteractionResponse | void>;
}

export async function RegisterSubCommand<Interaction extends ChatInputCommandInteraction | ContextMenuCommandInteraction>(options: RegisterSubCommandOptions<Interaction>): Promise<void> {
    switch (true) {
        case options.interaction.isChatInputCommand(): {
            if (options.interaction.options.getSubcommand() === options.subCommand) {
                await options.callback(options.ctx, options.interaction);
            }
            break;
        }
        case options.interaction.isContextMenuCommand(): {
            if (options.interaction.commandName === options.subCommand) {
                await options.callback(options.ctx, options.interaction);
            }
            break;
        }
        case options.interaction.isAutocomplete(): {
            if (options.autocomplete && options.interaction.options.getSubcommand() === options.subCommand) {
                await options.autocomplete(options.ctx, options.interaction);
            }
            break;
        }
    }
}
