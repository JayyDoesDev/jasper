import { ApplicationCommandOptionType } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, TagResponse } from '../../../Services/TagService';

export const UseSubCommand = defineSubCommand({
    name: 'use',
    allowedRoles: [process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE],
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const name = interaction.options.getString('tag-name', true);
        const mention = interaction.options.getUser('mention');

        await interaction.deferReply();

        await ctx.services.tags.configure<Options>({ guildId, name });
        const tag = await ctx.services.tags.getValues<Options, TagResponse>();

        if (!tag) {
            await interaction.editReply('Tag not found.');
            return;
        }

        const embed = {
            title: tag.TagEmbedTitle,
            color: global.embedColor,
            description: tag.TagEmbedDescription,
            image: { url: tag.TagEmbedImageURL },
            footer: { text: tag.TagEmbedFooter },
        };

        const content = mention ? `${mention}` : undefined;
        await interaction.editReply({ content, embeds: [embed] });
    },
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
});

export const commandOptions = {
    name: UseSubCommand.name,
    description: "Display a tag's content",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'tag-name',
            description: 'The name of the tag to use',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
        {
            name: 'mention',
            description: 'The user to mention with the tag',
            type: ApplicationCommandOptionType.USER,
            required: false,
        },
    ],
};
