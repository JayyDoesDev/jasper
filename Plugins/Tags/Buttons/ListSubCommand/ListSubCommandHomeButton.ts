import { ButtonInteraction } from "discord.js";
import { DefineEvent } from "../../../../Common/DefineEvent";
import { Context } from "../../../../Source/Context";
import { RegisterInteractionById } from "../../../../Common/RegisterInteractionById";
import { State } from "../../../types";

export = {
  Event: DefineEvent({
    event: {
        name: "interactionCreate",
        once: false
    },
    on: (interaction: ButtonInteraction, ctx: Context) => {
      RegisterInteractionById({
        id: `list_subcommand_button_home_${interaction.user.id}`,
        ctx: ctx,
        interaction: interaction,
        typeguards: {
          negativeTypeGuards: ["isButton"]
        },
        callback: async () => {
          const currentUserState = await ctx.store.getUser<State>({ user: interaction.user.id });
          if (!currentUserState) return;

          currentUserState.page = 0;
          await ctx.store.setUserKey({ user: interaction.user.id }, currentUserState);

          interaction.update({
            embeds: [
              {
                thumbnail: { url: interaction.guild.iconURL() },
                title: `Server Tag List`,
                description: currentUserState.tagPages[currentUserState.page].map((e, i) => `> **${i + 1}.** \`${e.TagName}\` **•** ${e.TagAuthor ? `<@${e.TagAuthor}>` : "None"}`).join("\n"),
                footer: { text: `Page: ${currentUserState.page + 1}/${currentUserState.tagPages.length} • emojis by AnThOnY & deussa`},
                color: 0x323338,
              }
            ],
          });
        }
      });
    }
  })
}
