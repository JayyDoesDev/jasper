import { ButtonInteraction, ComponentType, TextInputStyle } from "discord.js";
import { DefineEvent } from "../../../Common/DefineEvent";
import { Context } from "../../../Source/Context";
import { RegisterInteractionById } from "../../../Common/RegisterInteractionById";

export = {
    Event: DefineEvent({
        event: {
            name: "interactionCreate",
            once: false
        },
        on: (interaction: ButtonInteraction, ctx: Context) => {
            RegisterInteractionById({
                id: `vote_button`,
                ctx: ctx,
                interaction: interaction,
                typeguards: {
                    negativeTypeGuards: ["isButton"]
                },
                callback: async () => {
                    await interaction.showModal(
                        {
                            customId: `vote_form_${interaction.user.id}`,
                            title: "Vote!",
                            components: [
                                {
                                    type: ComponentType.ActionRow,
                                    components: [
                                        {
                                            type: ComponentType.TextInput,
                                            customId: "vote_candidate",
                                            label: "Candidate",
                                            placeholder: "Provide the user id of the user!",
                                            maxLength: 80,
                                            style: TextInputStyle.Short,
                                            required: true
                                        }
                                    ]
                                }
                            ]
                        }
                    )
                }
            })
        }
    })
}