import { ApplicationCommandType } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import { ChatInputCommandInteraction } from 'discord.js';
import {
    subCommandOptions,
    CreateSubCommand,
    DeleteSubCommand,
    ShowSubCommand,
    ListSubCommand,
    InfoSubCommand,
    RawSubCommand,
    UseSubCommand,
    EditSubCommand,
    ImportSubCommand,
} from '../SubCommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'tag',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'Create, list, edit, and delete tags!',
            options: subCommandOptions,
        },
        subCommands: {
            create: CreateSubCommand,
            delete: DeleteSubCommand,
            show: ShowSubCommand,
            list: ListSubCommand,
            info: InfoSubCommand,
            raw: RawSubCommand,
            use: UseSubCommand,
            edit: EditSubCommand,
            import: ImportSubCommand,
        },
        on: async () => {},
        autocomplete: async (ctx, interaction) => {
            const subCommand = interaction.options.getSubcommand(false);
            if (!subCommand) {
                await interaction.respond([]);
                return;
            }

            const subCommandHandler = {
                delete: DeleteSubCommand,
                show: ShowSubCommand,
                info: InfoSubCommand,
                raw: RawSubCommand,
                use: UseSubCommand,
                edit: EditSubCommand,
                import: ImportSubCommand,
            }[subCommand];

            if (!subCommandHandler) {
                await interaction.respond([]);
                return;
            }

            await subCommandHandler.autocomplete(ctx, interaction);
        },
    }),
};
