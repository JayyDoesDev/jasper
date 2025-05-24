import { ApplicationCommandOptionType } from '@antibot/interactions';
import { ChatInputCommandInteraction, ComponentType, TextInputStyle } from 'discord.js';

import { Context } from '../../../classes/context';
import { ConfigurationRoles } from '../../../container';
import { defineSubCommand } from '../../../define';

export const CreateSubCommand = defineSubCommand({
    handler: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
        await interaction.showModal({
            components: [
                {
                    components: [
                        {
                            customId: 'tag_create_embed_name',
                            label: 'Tag',
                            maxLength: 80,
                            placeholder: 'support',
                            required: true,
                            style: TextInputStyle.Short,
                            type: ComponentType.TextInput,
                        },
                    ],
                    type: ComponentType.ActionRow,
                },
                {
                    components: [
                        {
                            customId: 'tag_create_embed_title',
                            label: 'Embed Title',
                            maxLength: 200,
                            placeholder: 'How do I contact support?',
                            required: true,
                            style: TextInputStyle.Short,
                            type: ComponentType.TextInput,
                        },
                    ],
                    type: ComponentType.ActionRow,
                },
                {
                    components: [
                        {
                            customId: 'tag_create_embed_description',
                            label: 'Embed Description',
                            maxLength: 3000,
                            placeholder: 'You can contact us in the support threads!',
                            required: false,
                            style: TextInputStyle.Paragraph,
                            type: ComponentType.TextInput,
                        },
                    ],
                    type: ComponentType.ActionRow,
                },
                {
                    components: [
                        {
                            customId: 'tag_create_embed_image_url',
                            label: 'Embed Image URL',
                            maxLength: 500,
                            placeholder:
                                'https://i.pinimg.com/originals/ba/92/7f/ba927ff34cd961ce2c184d47e8ead9f6.jpg',
                            required: false,
                            style: TextInputStyle.Short,
                            type: ComponentType.TextInput,
                        },
                    ],
                    type: ComponentType.ActionRow,
                },
                {
                    components: [
                        {
                            customId: 'tag_create_embed_footer',
                            label: 'Embed Footer',
                            maxLength: 40,
                            placeholder: 'Make sure to be patient!',
                            required: false,
                            style: TextInputStyle.Short,
                            type: ComponentType.TextInput,
                        },
                    ],
                    type: ComponentType.ActionRow,
                },
            ],
            customId: `tag_create_${interaction.user.id}`,
            title: 'Create a support tag',
        });
    },
    name: 'create',
    restrictToConfigRoles: [
        ConfigurationRoles.SupportRoles,
        ConfigurationRoles.StaffRoles,
        ConfigurationRoles.AdminRoles,
        ConfigurationRoles.TagAdminRoles,
        ConfigurationRoles.TagRoles,
    ],
});

export const commandOptions = {
    description: 'Create a tag!',
    name: CreateSubCommand.name,
    options: [],
    type: ApplicationCommandOptionType.SUB_COMMAND,
};
