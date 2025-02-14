import { ApplicationCommandType, PermissionBitToString, Permissions } from '@antibot/interactions';
import { defineCommand } from '../../../Common/define';
import { ChatInputCommandInteraction } from 'discord.js';
import { subCommandOptions, AddChannelSubCommand, RemoveChannelSubCommand } from '../SubCommands';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'settings',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'Configure the settings',
            default_member_permissions: PermissionBitToString(Permissions({ BanMembers: true })),
            options: subCommandOptions,
        },
        subCommands: { add_channel: AddChannelSubCommand, remove_channel: RemoveChannelSubCommand },
        on: async () => {},
        autocomplete: async (ctx, interaction) => {
            const subCommand = interaction.options.getSubcommand(false);
            if (!subCommand) {
                await interaction.respond([]);
                return;
            }

            const subCommandHandler = {
                add_channel: AddChannelSubCommand,
                remove_channel: RemoveChannelSubCommand,
            }[subCommand];

            if (!subCommandHandler) {
                await interaction.respond([]);
                return;
            }

            await subCommandHandler.autocomplete(ctx, interaction);
        },
    }),
};
