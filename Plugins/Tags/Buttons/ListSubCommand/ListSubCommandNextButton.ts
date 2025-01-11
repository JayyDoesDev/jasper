import { ButtonInteraction } from "discord.js";
import { defineEvent } from "../../../../Common/define";
import { Context } from "../../../../Source/Context";
import { RegisterInteractionById } from "../../../../Common/RegisterInteractionById";
import { State } from "../../../types";

export = {
  Event: defineEvent({
    event: {
        name: "interactionCreate",
        once: false
    },
    on: (interaction: ButtonInteraction, ctx: Context) => {
      RegisterInteractionById({
        id: `list_subcommand_button_next_${interaction.user.id}`,
        ctx: ctx,
        interaction: interaction,
        typeguards: {
          negativeTypeGuards: ["isButton"]
        },
        callback: () => {
          const currentUserState: State = ctx.pagination.get(interaction.user.id);
          if (!currentUserState) return;

          const newPage = (currentUserState.page + 1) % currentUserState.tagPages.length;
          currentUserState.page = newPage;
          ctx.pagination.set(interaction.user.id, currentUserState);

          interaction.update({
            embeds: [
              {
                thumbnail: { url: interaction.guild.iconURL() },
                title: `Server Tag List`,
                description: currentUserState.tagPages[currentUserState.page].map((e, i) => `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : "None"}`).join("\n"),
                footer: { text: `Page: ${currentUserState.page + 1}/${currentUserState.tagPages.length} • emojis by AnThOnY & deussa`},
                color: global.embedColor,
              }
            ],
          });
        }
      });
    }
  })
}
