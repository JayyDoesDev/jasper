import { ApplicationCommandType } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { checkForRoles } from '../../../Common/roles';
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
        on: async (ctx: Context, interaction) => {
            if (
                !checkForRoles(
                    interaction,
                    process.env.ADMIN_ROLE,
                    process.env.STAFF_ROLE,
                    process.env.SUPPORT_ROLE,
                )
            ) {
                await interaction.reply({
                    content: "Sorry but you can't use this command.",
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            await interaction.reply({
                content: 'This command or subcommand is not properly configured.',
                flags: MessageFlags.Ephemeral,
            });
        },
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

            if (!subCommandHandler?.autocomplete) {
                await interaction.respond([]);
                return;
            }

            if (
                !checkForRoles(
                    interaction,
                    process.env.ADMIN_ROLE,
                    process.env.STAFF_ROLE,
                    process.env.SUPPORT_ROLE,
                )
            ) {
                await interaction.respond([]);
                return;
            }

            await subCommandHandler.autocomplete(ctx, interaction);
        },
    }),
};
