import { ButtonInteraction, ButtonStyle, ComponentType } from 'discord.js';
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
                            `> **${currentUserState.page * 10 + i + 1}.** \`${e.TagName}\` **•** ${
                                e.TagAuthor ? `<@${e.TagAuthor}>` : 'None'
                            }`,
                    )
                    .join('\n');

                embedBase.footer.text = `Page: ${currentUserState.page + 1}/${
                    currentUserState.tagPages.length
                } • emojis by AnThOnY & deussa`;

                const components = [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.Button,
                                customId: `list_subcommand_button_previous_${interaction.user.id}`,
                                style: ButtonStyle.Primary,
                                label: 'Previous',
                                disabled: currentUserState.page === 0,
                            },
                            {
                                type: ComponentType.Button,
                                customId: `list_subcommand_button_home_${interaction.user.id}`,
                                style: ButtonStyle.Secondary,
                                label: 'Home',
                            },
                            {
                                type: ComponentType.Button,
                                customId: `list_subcommand_button_next_${interaction.user.id}`,
                                style: ButtonStyle.Primary,
                                label: 'Next',
                                disabled:
                                    currentUserState.page === currentUserState.tagPages.length - 1,
                            },
                        ],
                    },
                ];

                await interaction.update({
                    embeds: [embedBase],
                    ...components,
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
