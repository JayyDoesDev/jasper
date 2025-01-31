import { ApplicationCommandType, PermissionBitToString, Permissions } from "@antibot/interactions";
import { defineCommand } from "../../../Common/define";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { subCommandOptions, NotifyVideoDiscussionsSubCommand } from "../SubCommands";

export = {
  Command: defineCommand<ChatInputCommandInteraction>({
    command: {
      name: "bruteforce",
      type: ApplicationCommandType.CHAT_INPUT,
      description: "Force Jasper to do something.",
      default_member_permissions: PermissionBitToString(Permissions({ Administrator: true })),
      options: subCommandOptions
    },
    subCommands: {
      notify_video_discussions: NotifyVideoDiscussionsSubCommand
    },
    on: async (ctx: Context, interaction) => {
      await interaction.reply({
        content: "This command or subcommand is not properly configured.",
        flags: MessageFlags.Ephemeral
      });
    }
  })
};
