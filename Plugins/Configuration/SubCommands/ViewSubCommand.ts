import { ApplicationCommandOptionType, Snowflake } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options } from '../../../Services/SettingsService';
import { Emojis } from '../../../Common/enums';

const createTable = (table: string, fields: string[], locked: boolean) => {
    if (fields.length === 0) return '';
    return `**${table}** ${locked ? Emojis.LOCK : Emojis.UNLOCKED}\n${fields.join('')}\n`;
};

const createField = (
    field: string,
    data: Snowflake[],
    options: { isChannel: boolean; isUser: boolean; isRole: boolean },
) => {
    if (!data || data.length === 0) {
        return `   * **${field}:** None\n`;
    }

    const formattedData = data
        .slice(0, 8)
        .map((id) =>
            options.isChannel
                ? `<#${id}>`
                : options.isUser
                  ? `<@${id}>`
                  : options.isRole
                    ? `<@&${id}>`
                    : id,
        );
    const suffix = data.length > 8 ? ` *(+${data.length - 8} more)*` : '';
    return `   * **${field}:** ${formattedData.join(', ')}${suffix}\n`;
};

export const ViewChannelSubCommand = defineSubCommand({
    name: 'view',
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        await ctx.services.settings.configure<Options>({ guildId: interaction.guildId! });
        const { Channels, Roles, Users, Skullboard } = ctx.services.settings.getSettings();

        await interaction.reply({
            embeds: [
                {
                    thumbnail: { url: interaction.guild?.iconURL() },
                    title: `${interaction.guild?.name} Configuration`,
                    description:
                        createTable(
                            'Channels',
                            [
                                createField('Allowed Tag Channels', Channels.AllowedTagChannels, {
                                    isChannel: true,
                                    isUser: false,
                                    isRole: false,
                                }),
                                createField(
                                    'Allowed Snipe Channels',
                                    Channels.AllowedSnipeChannels,
                                    {
                                        isChannel: true,
                                        isUser: false,
                                        isRole: false,
                                    },
                                ),
                            ],
                            false,
                        ) +
                        createTable(
                            'Roles',
                            [
                                createField('Support Roles', Roles.SupportRoles, {
                                    isChannel: false,
                                    isUser: false,
                                    isRole: true,
                                }),
                                createField('Allowed Tag Roles', Roles.AllowedTagRoles, {
                                    isChannel: false,
                                    isUser: false,
                                    isRole: true,
                                }),
                                createField('Allowed Tag Admin Roles', Roles.AllowedTagAdminRoles, {
                                    isChannel: false,
                                    isUser: false,
                                    isRole: true,
                                }),
                                createField('Allowed Admin Roles', Roles.AllowedAdminRoles, {
                                    isChannel: false,
                                    isUser: false,
                                    isRole: true,
                                }),
                                createField('Allowed Staff Roles', Roles.AllowedStaffRoles, {
                                    isChannel: false,
                                    isUser: false,
                                    isRole: true,
                                }),
                                createField('Ignored Sniped Roles', Roles.IgnoredSnipedRoles, {
                                    isChannel: false,
                                    isUser: false,
                                    isRole: true,
                                }),
                            ],
                            false,
                        ) +
                        createTable(
                            'Users',
                            [
                                createField('Ignored Sniped Users', Users.IgnoreSnipedUsers, {
                                    isChannel: false,
                                    isUser: true,
                                    isRole: false,
                                }),
                            ],
                            false,
                        ) +
                        createTable(
                            'Skullboard',
                            [
                                `   * **Skullboard Channel:** ${Skullboard.SkullboardChannel ? `<#${Skullboard.SkullboardChannel}>` : 'None'}\n`,
                                `   * **Emoji:** ${Skullboard.SkullboardEmoji ?? '💀'}\n`,
                                `   * **Reaction Threshold:** ${Skullboard.SkullboardReactionThreshold}\n`,
                            ],
                            false,
                        ) +
                        createTable(
                            'Slowmode',
                            [
                                createField(
                                    'Automatic Slowmode Channels',
                                    Channels.AutomaticSlowmodeChannels,
                                    {
                                        isChannel: true,
                                        isUser: false,
                                        isRole: false,
                                    },
                                ),
                                `   * **Cooldown:** ${global.slowmodeCooldown}s\n`,
                                `   * **Message Time Window:** ${global.messageTimeWindow}s\n`,
                                `   * **Message Threshold:** ${global.messageThreshold}\n`,
                            ],
                            true,
                        ),
                    color: global.embedColor,
                    footer: {
                        icon_url: interaction.user.displayAvatarURL(),
                        text: `Locked = Locked Configuration | Unlocked = Configurable Configuration`,
                    },
                },
            ],
        });
    },
});

export const commandOptions = {
    name: 'view',
    description: 'View the current configuration of the guild',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [],
};
