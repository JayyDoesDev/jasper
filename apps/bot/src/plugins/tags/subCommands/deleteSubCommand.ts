import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationChannels, ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';
import { Options } from '../../../services/tagService';
import { handleTagAutocomplete, invalidateTagCache } from '../../../utils/tagCache';

export const DeleteSubCommand = defineSubCommand({
    autocomplete: handleTagAutocomplete,
    deferral: { defer: true, ephemeral: true },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const name = interaction.options.getString('tag-name', true);

        ctx.services.tags.configure<Options>({ guildId, name });
        const isDeleted = await ctx.services.tags.deleteValue<Options, boolean>();

        if (!isDeleted) {
            await interaction.editReply('Tag not found.');
            return;
        }

        // Invalidate cache after successful deletion
        invalidateTagCache(guildId);

        await interaction.editReply(`Tag \`${name}\` deleted successfully.`);
    },
    name: 'delete',
    restrictToConfigChannels: [ConfigurationChannels.AllowedTagChannels],
    restrictToConfigRoles: [
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
    ],
});

export const commandOptions = {
    description: 'Delete a tag!',
    name: DeleteSubCommand.name,
    options: [
        {
            autocomplete: true,
            description: 'The name of the tag to delete',
            name: 'tag-name',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
