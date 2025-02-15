import { ApplicationCommandOptionType } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, TagResponse } from '../../../Services/TagService';
import { ConfigurationRoles } from '../../../Common/container';

export const ShowSubCommand = defineSubCommand({
    name: 'show',
    restrictToConfigRoles: [
        ConfigurationRoles.SupportRoles,
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
        ConfigurationRoles.TagRoles,
    ],
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guildId!;
        const name = interaction.options.getString('tag-name', true);

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        ctx.services.tags.configure<Options>({ guildId, name });
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

        await interaction.editReply({ embeds: [embed] });
    },
    autocomplete: async (ctx: Context, interaction) => {
        const guildId = interaction.guildId!;
        const name = interaction.options.getString('tag-name') || '';

        const tags = await ctx.services.tags.getMultiValues<string, TagResponse[]>(guildId);
        const filtered = tags
            .filter((tag) => tag.TagName.toLowerCase().includes(name.toLowerCase()))
            .slice(0, 25)
            .map((tag) => ({ name: tag.TagName, value: tag.TagName }));

        await interaction.respond(filtered);
    },
});

export const commandOptions = {
    name: ShowSubCommand.name,
    description: "Show a tag's content",
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'tag-name',
            description: 'The name of the tag to show',
            type: ApplicationCommandOptionType.STRING,
            required: true,
            autocomplete: true,
        },
    ],
};
