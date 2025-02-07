import { ApplicationCommandOptionType } from '@antibot/interactions';
import { Context } from '../../../Source/Context';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { defineSubCommand } from '../../../Common/define';
import { Options, Tag } from '../../../Services/TagService';
import { Emojis } from '../../../Common/enums';

interface TagImportData {
    name: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    footer?: string | null;
}

function checkRequiredVariables(obj: unknown): obj is TagImportData {
    if (typeof obj !== 'object' || obj === null) return false;
    const record = obj as Record<string, unknown>;
    return typeof record.name === 'string' && typeof record.title === 'string';
}

export const ImportSubCommand = defineSubCommand({
    name: 'import',
    allowedRoles: [process.env.ADMIN_ROLE, process.env.STAFF_ROLE],
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        const guildId = interaction.guild.id;
        const jsonString = interaction.options.getString('json', true);

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        let data: unknown;
        try {
            data = JSON.parse(jsonString);
        } catch (error) {
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
            name: nameInput,
            title: titleInput,
            author: interaction.user.id,
            description: tagDataInput.description ?? null,
            image_url: tagDataInput.imageUrl ?? null,
            footer: tagDataInput.footer ?? null,
        };

        await ctx.services.tags.configure<Options>({
            guildId,
            name: tagData.name,
            tag: tagData,
        });

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
                    title: tagData.title,
                    color: 0x323338,
                    description: tagData.description,
                    image: tagData.image_url ? { url: tagData.image_url } : undefined,
                    footer: { text: tagData.footer ?? '' },
                },
            ],
        });
    },
});

export const commandOptions = {
    name: ImportSubCommand.name,
    description: 'Import a tag from a JSON file',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [
        {
            name: 'json',
            description: 'The JSON string containing tag data',
            type: ApplicationCommandOptionType.STRING,
            required: true,
        },
    ],
};
