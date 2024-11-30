import { DefineEvent } from "../../../Common/DefineEvent";
import { ModalSubmitInteraction } from "discord.js";
import { Context } from "../../../Source/Context";
import { RegisterInteractionById } from "../../../Common/RegisterInteractionById";
import { AlreadyVoted } from "../Controllers/AlreadyVoted";
import { VoteCreate } from "../Controllers/VoteCreate";

export = {
    Event: DefineEvent({
        event: {
            name: "interactionCreate",
            once: false
        },
        on: (interaction: ModalSubmitInteraction, ctx: Context) => {
            RegisterInteractionById({
                id: `vote_form_${interaction.user.id}`,
                ctx: ctx,
                interaction: interaction,
                typeguards: {
                    negativeTypeGuards: ["isModalSubmit"]
                },
                callback: async (ctx: Context, interaction: ModalSubmitInteraction) => {
                    const candidate = interaction.fields.getTextInputValue("vote_candidate");
                    const message: { content: string, ephemeral: boolean } = { content: "This is not a valid user!", ephemeral: true };

                    if (!ctx.users.fetch(candidate)) return interaction.reply(message);
                    
                    if (candidate === interaction.user.id) {
                        return interaction.reply({ content: "You can't vote for yourself!", ephemeral: true })
                    }

                    if (await AlreadyVoted(interaction.user.id)) {
                        return interaction.reply({ content: "You already voted!", ephemeral: true });
                    } else {
                        await VoteCreate(interaction.user.id, candidate);
                        return interaction.reply({ content: "Thank you for voting!", ephemeral: true});
                    }
                }
            })
        }
    })
}