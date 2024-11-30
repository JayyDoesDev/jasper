import { ChatInputCommandInteraction, ComponentType, TextInputStyle } from "discord.js";
import { DefineCommand } from "../../../Common/DefineCommand";
import { ApplicationCommandType, PermissionBitToString, Permissions } from "@antibot/interactions";
import { Context } from "../../../Source/Context";

export = {
    Command: DefineCommand<ChatInputCommandInteraction>({
        command: {
            name: "vote",
            type: ApplicationCommandType.CHAT_INPUT,
            description: "Voting form",
            default_member_permissions: PermissionBitToString(
                Permissions({ Administrator: true })
            ),
            options: []
        },
        on: async (ctx: Context, interaction) => {
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