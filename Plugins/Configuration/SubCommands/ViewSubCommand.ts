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

const createField = (field: string, data: Snowflake[], isChannel = true) => {
    if (!data || data.length === 0) {
        return `   * **${field}:** None\n`;
    }
    const formattedData = data.slice(0, 8).map((id) => (isChannel ? `<#${id}>` : `<@&${id}>`));
    const suffix = data.length > 8 ? ` *(+${data.length - 8} more)*` : '';
    return `   * **${field}:** ${formattedData.join(', ')}${suffix}\n`;
};

export const ViewChannelSubCommand = defineSubCommand({
    name: 'view',
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        await ctx.services.settings.configure<Options>({ guildId: interaction.guildId! });
        const { Channels, Roles } = ctx.services.settings.getSettings();

        await interaction.reply({
            embeds: [
                {
                    thumbnail: { url: interaction.guild?.iconURL() },
                    title: `${interaction.guild?.name} Configuration`,
                    description:
                        createTable(
                            'Channels',
                            [
                                createField(
                                    'Allowed Tag Channels',
                                    Channels.AllowedTagChannels,
                                    true,
                                ),
                                createField(
                                    'Allowed Snipe Channels',
                                    Channels.AllowedSnipeChannels,
                                    true,
                                ),
                            ],
                            false,
                        ) +
                        createTable(
                            'Roles',
                            [
                                createField('Support Roles', Roles.SupportRoles, false),
                                createField('Allowed Tag Roles', Roles.AllowedTagRoles, false),
                                createField(
                                    'Allowed Tag Admin Roles',
                                    Roles.AllowedTagAdminRoles,
                                    false,
                                ),
                                createField('Allowed Admin Roles', Roles.AllowedAdminRoles, false),
                                createField('Allowed Staff Roles', Roles.AllowedStaffRoles, false),
                            ],
                            false,
                        ) +
                        createTable(
                            'Slowmode',
                            [
                                createField(
                                    'Automatic Slowmode Channels',
                                    Channels.AutomaticSlowmodeChannels,
                                    true,
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
