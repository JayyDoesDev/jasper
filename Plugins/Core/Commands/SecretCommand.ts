import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import {
    ApplicationCommandType,
    PermissionBitToString,
    Permissions,
    PermissionsToHuman,
} from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { defineCommand } from '../../../Common/define';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            name: 'secret',
            type: ApplicationCommandType.CHAT_INPUT,
            description: 'nothing to see here',
            default_member_permissions: PermissionBitToString(Permissions({ Administrator: true })),
            options: [],
        },
        on: (ctx: Context, interaction) => {
            return interaction.reply({
                embeds: [
                    {
                        title: 'Secret',
                        description: `**• Commands:** ${Array.from(ctx.interactions)
                            .map((x) => x[1].command.name)
                            .join(', ')}\n**• Permissions:** ${PermissionsToHuman(
                            interaction.appPermissions.bitfield,
                        ).join(', ')} `,
                        color: global.embedColor,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
        },
    }),
};
