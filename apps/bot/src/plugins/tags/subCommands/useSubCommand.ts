import { ApplicationCommandOptionType } from '@antibot/interactions';
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationChannels, ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';
import { Options, TagResponse } from '../../../services/tagService';

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

        ctx.services.tags.configure<Options>({ guildId, name });
        const tag = await ctx.services.tags.getValues<Options, TagResponse>();

        if (!tag) {
            await interaction.reply({ content: 'Tag not found.', ephemeral: true });
            return;
        }

        await interaction.deferReply();
        const container = new ContainerBuilder().setAccentColor(global.embedColor);

        let mentionText = null;
        if (mention) {
            mentionText = new TextDisplayBuilder().setContent(`${mention}`);
        }

        container
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${tag.TagEmbedTitle}`),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${tag.TagEmbedDescription}`),
            );

        if (tag.TagEmbedImageURL) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(`${tag.TagEmbedImageURL}`),
                ),
            );
        }

        if (tag.TagEmbedFooter) {
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            ),
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`-# ${tag.TagEmbedFooter}`),
                );
        }

        await interaction.editReply({
            components: mentionText ? [mentionText, container] : [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
    name: 'use',
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
