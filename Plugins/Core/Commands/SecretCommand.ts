import {
    ApplicationCommandType,
    PermissionBitToString,
    Permissions,
    PermissionsToHuman,
} from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { defineCommand } from '../../../Common/define';
import { Context } from '../../../Source/Context';

export = {
    Command: defineCommand<ChatInputCommandInteraction>({
        command: {
            default_member_permissions: PermissionBitToString(Permissions({ Administrator: true })),
            description: 'nothing to see here',
            name: 'secret',
            options: [],
            type: ApplicationCommandType.CHAT_INPUT,
        },
        on: (ctx: Context, interaction) => {
            return interaction.reply({
                embeds: [
                    {
                        color: global.embedColor,
                        description: `**• Commands:** ${Array.from(ctx.interactions)
                            .map((x) => x[1].command.name)
                            .join(', ')}\n**• Permissions:** ${PermissionsToHuman(
                            interaction.appPermissions.bitfield,
                        ).join(', ')} `,
                        title: 'Secret',
                    },
                ],
                flags: MessageFlags.Ephemeral,
            });
        },
    }),
};
