import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, codeBlock } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationChannels, ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';
import { Options, TagResponse } from '../../../services/tagService';
import { handleTagAutocomplete } from '../../../utils/tagCache';

export const RawSubCommand = defineSubCommand({
    autocomplete: handleTagAutocomplete,
    deferral: {
        defer: true,
        ephemeral: true,
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const name = interaction.options.getString('tag-name', true);

        ctx.services.tags.configure<Options>({ guildId, name });
        const tag = await ctx.services.tags.getValues<Options, TagResponse>();

        if (!tag) {
            await interaction.editReply('Tag not found.');
            return;
        }

        const rawContent = {
            description: tag.TagEmbedDescription,
            footer: tag.TagEmbedFooter,
            imageUrl: tag.TagEmbedImageURL,
            name: tag.TagName,
            title: tag.TagEmbedTitle,
        };

        await interaction.editReply({
            content: codeBlock('json', JSON.stringify(rawContent, null, 2)),
        });
    },
    name: 'raw',
    restrictToConfigChannels: [ConfigurationChannels.AllowedTagChannels],
    restrictToConfigRoles: [
        ConfigurationRoles.SupportRoles,
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
        ConfigurationRoles.TagRoles,
    ],
});

export const commandOptions = {
    description: 'Show the raw content of a tag',
    name: RawSubCommand.name,
    options: [
        {
            autocomplete: true,
            description: 'The name of the tag to show raw content for',
            name: 'tag-name',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
