import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { ConfigurationRoles } from '../../../Common/container';
import { defineSubCommand } from '../../../Common/define';
import { Options, TagResponse } from '../../../Services/TagService';
import { Context } from '../../../Source/Context';

export const UseSubCommand = defineSubCommand({
    autocomplete: async (ctx: Context, interaction) => {
        const guildId = interaction.guildId!;
        const query = interaction.options.getString('tag-name') || '';

        const tags = await ctx.services.tags.getMultiValues<string, TagResponse[]>(guildId);
        const filtered = tags
            .filter((tag) => tag.TagName.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 25)
            .map((tag) => ({ name: tag.TagName, value: tag.TagName }));

        await interaction.respond(filtered);
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const name = interaction.options.getString('tag-name', true);
        const mention = interaction.options.getUser('mention');

        await interaction.deferReply();

        ctx.services.tags.configure<Options>({ guildId, name });
        const tag = await ctx.services.tags.getValues<Options, TagResponse>();

        if (!tag) {
            await interaction.editReply('Tag not found.');
            return;
        }

        const embed = {
            color: global.embedColor,
            description: tag.TagEmbedDescription,
            footer: { text: tag.TagEmbedFooter },
            image: { url: tag.TagEmbedImageURL },
            title: tag.TagEmbedTitle,
        };

        const content = mention ? `${mention}` : undefined;
        await interaction.editReply({ content, embeds: [embed] });
    },
    name: 'use',
    restrictToConfigRoles: [
        ConfigurationRoles.SupportRoles,
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
        ConfigurationRoles.TagRoles,
    ],
});

export const commandOptions = {
    description: "Display a tag's content",
    name: UseSubCommand.name,
    options: [
        {
            autocomplete: true,
            description: 'The name of the tag to use',
            name: 'tag-name',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
        {
            description: 'The user to mention with the tag',
            name: 'mention',
            required: false,
            type: ApplicationCommandOptionType.USER,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
