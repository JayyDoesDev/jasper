import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationChannels, ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';
import { Emojis } from '../../../enums';
import { Options, Tag } from '../../../services/tagService';

interface TagImportData {
    description?: null | string;
    footer?: null | string;
    imageUrl?: null | string;
    name: string;
    title: string;
}

function checkRequiredVariables(obj: unknown): obj is TagImportData {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return typeof record.name === 'string' && typeof record.title === 'string';
}

export const ImportSubCommand = defineSubCommand({
    deferral: {
        defer: true,
        ephemeral: true,
    },
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guild.id;
        const jsonString = interaction.options.getString('json', true);

        let data: unknown;
        try {
            data = JSON.parse(jsonString);
        } catch {
            await interaction.editReply('> The JSON provided is invalid.');
            return;
        }

        if (!checkRequiredVariables(data)) {
            await interaction.editReply(
                '> The JSON must contain at least "name" and "title" fields.',
            );
            return;
        }

        const tagDataInput: TagImportData = data;

        const nameInput = tagDataInput.name.trim();
        const titleInput = tagDataInput.title.trim();

        if (!nameInput) {
            await interaction.editReply('> The JSON must have a non-empty "name" field.');
            return;
        }
        if (!titleInput) {
            await interaction.editReply('> The JSON must have a non-empty "title" field.');
            return;
        }

        const tagData: Tag = {
            author: interaction.user.id,
            description: tagDataInput.description ?? null,
            footer: tagDataInput.footer ?? null,
            image_url: tagDataInput.imageUrl ?? null,
            name: nameInput,
            title: titleInput,
        };

        await ctx.services.tags.configure<Options>({ guildId, name: tagData.name, tag: tagData });

        if (await ctx.services.tags.itemExists<Options>()) {
            await interaction.editReply(`> The support tag \`${tagData.name}\` already exists!`);
            return;
        }
        if (
            tagData.image_url &&
            !/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(tagData.image_url)
        ) {
            await interaction.editReply('> The provided image link is not a valid image URL!');
            return;
        }

        await ctx.services.tags.create<Options & { tag: Tag }, void>();

        await interaction.editReply({
            content: `${Emojis.CHECK_MARK} Successfully imported the tag \`${tagData.name}\`!`,
            embeds: [
                {
                    color: 0x323338,
                    description: tagData.description,
                    footer: { text: tagData.footer ?? '' },
                    image: tagData.image_url ? { url: tagData.image_url } : undefined,
                    title: tagData.title,
                },
            ],
        });
    },
    name: 'import',
    restrictToConfigChannels: [ConfigurationChannels.AllowedTagChannels],
    restrictToConfigRoles: [
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
    ],
});

export const commandOptions = {
    description: 'Import a tag from a JSON file',
    name: ImportSubCommand.name,
    options: [
        {
            description: 'The JSON string containing tag data',
            name: 'json',
            required: true,
            type: ApplicationCommandOptionType.STRING,
        },
    ],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
