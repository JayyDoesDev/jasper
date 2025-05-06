import { ApplicationCommandType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { defineCommand } from '../../../Common/define';
import {
    CreateSubCommand,
    DeleteSubCommand,
    EditSubCommand,
    ImportSubCommand,
    InfoSubCommand,
    ListSubCommand,
    RawSubCommand,
    ShowSubCommand,
    subCommandOptions,
    UseSubCommand,
} from '../SubCommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        autocomplete: async (ctx, interaction) => {
            const subCommand = interaction.options.getSubcommand(false);
            if (!subCommand) {
                await interaction.respond([]);
                return;
            }

            const subCommandHandler = {
                delete: DeleteSubCommand,
                edit: EditSubCommand,
                import: ImportSubCommand,
                info: InfoSubCommand,
                raw: RawSubCommand,
                show: ShowSubCommand,
                use: UseSubCommand,
            }[subCommand];

            if (!subCommandHandler) {
                await interaction.respond([]);
                return;
            }

            await subCommandHandler.autocomplete(ctx, interaction);
        },
        command: {
            description: 'Create, list, edit, and delete tags!',
            name: 'tag',
            options: subCommandOptions,
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: async () => {},
        subCommands: {
            create: CreateSubCommand,
            delete: DeleteSubCommand,
            edit: EditSubCommand,
            import: ImportSubCommand,
            info: InfoSubCommand,
            list: ListSubCommand,
            raw: RawSubCommand,
            show: ShowSubCommand,
            use: UseSubCommand,
        },
    }),
};
