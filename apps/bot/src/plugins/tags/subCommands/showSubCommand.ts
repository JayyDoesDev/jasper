import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';
import { Options, TagResponse } from '../../../services/tagService';

export const ShowSubCommand = defineSubCommand({
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

        const container = new (require('discord.js').ContainerBuilder)().setAccentColor(global.embedColor)
            .addTextDisplayComponents(
                new (require('discord.js').TextDisplayBuilder)().setContent(`### ${tag.TagEmbedTitle}`),
            )
            .addSeparatorComponents(
                new (require('discord.js').SeparatorBuilder)().setSpacing(require('discord.js').SeparatorSpacingSize.Large).setDivider(true),
            )
            .addTextDisplayComponents(
                new (require('discord.js').TextDisplayBuilder)().setContent(`${tag.TagEmbedDescription}`),
            )
            .addSeparatorComponents(
                new (require('discord.js').SeparatorBuilder)().setSpacing(require('discord.js').SeparatorSpacingSize.Small).setDivider(true),
            );

        if (tag.TagEmbedImageURL) {
            container.addMediaGalleryComponents(
                new (require('discord.js').MediaGalleryBuilder)()
                    .addItems(
                        new (require('discord.js').MediaGalleryItemBuilder)()
                            .setURL(`${tag.TagEmbedImageURL}`),
                    ),
            );
        }
        container.addTextDisplayComponents(
            new (require('discord.js').TextDisplayBuilder)().setContent(`-# ${tag.TagEmbedFooter}`)
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    },
    name: 'show',
    restrictToConfigRoles: [
        ConfigurationRoles.SupportRoles,
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
        ConfigurationRoles.TagRoles,
    ],
});

export const commandOptions = {
    description: "Show a tag's content",
    name: ShowSubCommand.name,
    options: [
        {
            autocomplete: true,
            description: 'The name of the tag to show',
            name: 'tag-name',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
