import {
    ButtonInteraction,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder
} from 'discord.js';
import { defineEvent } from '../../../Common/define';
import { Context } from '../../../Source/Context';

export = {
    Event: defineEvent({
        event: {
            name: 'interactionCreate',
            once: false,
        },
        on: async (interaction: ButtonInteraction, ctx: Context) => {
            if (!interaction.isButton()) return;
            
            const author = interaction.user.id;
            const title = 'Server Tag List';
            const thumbnail = { url: interaction.guild.iconURL() ?? '' };
            const color = global.embedColor;

            const currentUserState = ctx.pagination.get(author);
            if (!currentUserState) return;

            const embedBase = {
                thumbnail,
                title,
                color,
                description: '',
                footer: {
                    text: '',
                },
            };

            const updateEmbed = async () => {
                embedBase.description = currentUserState.tagPages[currentUserState.page]
                    .map(
                        (e, i) =>
                            `> **${(currentUserState.page * 10) + i + 1}.** \`${e.TagName}\` **•** ${
                                e.TagAuthor ? `<@${e.TagAuthor}>` : 'None'
                            }`,
                    )
                    .join('\n');

                embedBase.footer.text = `Page: ${currentUserState.page + 1}/${
                    currentUserState.tagPages.length
                } • emojis by AnThOnY & deussa`;

                const updatedComponents = [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`list_subcommand_button_previous_${interaction.user.id}`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel('Previous')
                            .setDisabled(currentUserState.page === 0),
                        new ButtonBuilder()
                            .setCustomId(`list_subcommand_button_home_${interaction.user.id}`)
                            .setStyle(ButtonStyle.Secondary)
                            .setLabel('Home'),
                        new ButtonBuilder()
                            .setCustomId(`list_subcommand_button_next_${interaction.user.id}`)
                            .setStyle(ButtonStyle.Primary)
                            .setLabel('Next')
                            .setDisabled(currentUserState.page === currentUserState.tagPages.length - 1)
                    )
                ];

                await interaction.update({
                    embeds: [embedBase],
                    components: updatedComponents,
                });
            };

            switch (interaction.customId) {
                case `list_subcommand_button_home_${author}`:
                    currentUserState.page = 0;
                    break;

                case `list_subcommand_button_next_${author}`:
                    currentUserState.page =
                        (currentUserState.page + 1) % currentUserState.tagPages.length;
                    break;

                case `list_subcommand_button_previous_${author}`:
                    currentUserState.page =
                        (currentUserState.page - 1 + currentUserState.tagPages.length) %
                        currentUserState.tagPages.length;
                    break;

                default:
                    break;
            }

            ctx.pagination.set(author, currentUserState);
            await updateEmbed();
        },
    }),
};
