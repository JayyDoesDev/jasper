import { ButtonInteraction } from 'discord.js';
import { defineEvent } from '../../../Common/define';
import { Context } from '../../../Source/Context';

export = {
    Event: defineEvent({
        event: {
            name: 'interactionCreate',
            once: false,
        },
        on: (interaction: ButtonInteraction, ctx: Context) => {
            const author = interaction.user.id;
            const title = 'Server Tag List';
            const thumbnail = { url: interaction.guild.iconURL() };
            const color = global.embedColor;

            const currentUserState = ctx.pagination.get(author);
            if (!currentUserState) return;

            const embed = {
                embeds: [
                    {
                        thumbnail,
                        title,
                        color,
                        description: '',
                        footer: {
                            text: `Page: 1/${currentUserState.tagPages.length} • emojis by AnThOnY & deussa`,
                        },
                    },
                ],
            };

            const updateEmbed = () => {
                embed.embeds[0].description = currentUserState.tagPages[currentUserState.page]
                    .map(
                        (e, i) =>
                            `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : 'None'}`,
                    )
                    .join('\n');

                embed.embeds[0].footer.text = `Page: ${currentUserState.page + 1}/${currentUserState.tagPages.length} • emojis by AnThOnY & deussa`;

                interaction.update({ ...embed });
            };

            if (interaction.isButton()) {
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
                }

                ctx.pagination.set(author, currentUserState);
                updateEmbed();
            }
        },
    }),
};
