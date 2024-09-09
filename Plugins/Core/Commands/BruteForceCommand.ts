import { ChatInputCommandInteraction } from "discord.js";
import { DefineCommand } from "../../../Common/DefineCommand";
import { ApplicationCommandOptions, ApplicationCommandType, PermissionBitToString, Permissions } from "@antibot/interactions";
import { Context } from "../../../Source/Context";
import { NotifyVideoDiscussionsSubCommand, RunNotifyVideoDiscussionsSubCommand } from "../SubCommands/NotifyVideoDiscussionsSubCommand";

const subCommands: ApplicationCommandOptions[] = [NotifyVideoDiscussionsSubCommand];

export = {
    Command: DefineCommand<ChatInputCommandInteraction>({
        command: {
            name: "bruteforce",
            type: ApplicationCommandType.CHAT_INPUT,
            description: "Force Jasper to do something.",
            default_member_permissions: PermissionBitToString(Permissions({ Administrator: true })),
            options: subCommands
        },
        on: async (ctx: Context, interaction: ChatInputCommandInteraction) => {
            switch (interaction.options.getSubcommand()) {
                case 'notify_video_discussions':
                    await RunNotifyVideoDiscussionsSubCommand(ctx, interaction);
            }
        }
    })
}