import {
    ApplicationCommandType,
    PermissionBitToString,
    Permissions,
    PermissionsToHuman,
} from '@antibot/interactions';
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';

import { Context } from '../../../classes/context';
import { defineCommand } from '../../../define';

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
            const commands = Array.from(ctx.interactions).map((x) => `- \`${x[1].command.name}\``);
            const permissions = PermissionsToHuman(interaction.appPermissions.bitfield).map(
                (p) => `- \`${p}\``,
            );

            const secretComponents = [
                new ContainerBuilder()
                    .setAccentColor(global.embedColor)
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Secret'))
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true),
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `**### Commands:**\n${commands.join('\n')}`,
                        ),
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true),
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `**### Permissions:**\n${permissions.join('\n')}`,
                        ),
                    ),
            ];

            return interaction.reply({
                components: secretComponents,
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });
        },
    }),
};
