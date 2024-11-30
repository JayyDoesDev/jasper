import { ButtonStyle, ChatInputCommandInteraction, ComponentType } from "discord.js";
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
        on: (ctx: Context, interaction) => {
            return interaction.reply({
                content: "> Click this button to vote!",
                components: [
                    {
                        type: ComponentType.ActionRow,
                        components: [
                            {
                                type: ComponentType.Button,
                                label: 'Vote Today!',
                                customId: `vote_button`,
                                style: ButtonStyle.Primary
                            }
                        ]
                    }
                ]
            })
        }
    })
}