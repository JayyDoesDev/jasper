import { ApplicationCommandOptions, ApplicationCommandType, } from "@antibot/interactions";
import { defineCommand } from "../../../Common/define";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction } from "discord.js";
import {
  CreateSubCommand,
  DeleteSubCommand,
  EditSubCommand,
  InfoSubCommand,
  ListSubCommand,
  RunCreateSubCommand,
  RunDeleteSubCommand,
  RunEditSubCommand,
  RunInfoSubCommand,
  RunListSubCommand,
  RunShowSubCommand,
  RunUseSubCommand,
  RunRawSubCommand,
  ShowSubCommand,
  UseSubCommand,
  RawSubCommand,
} from "../SubCommands";
import { checkForRoles } from "../../../Common/roles";
import { TagGet } from "../Controllers/TagGet";

const subCommands: ApplicationCommandOptions[] = [
  CreateSubCommand,
  ListSubCommand,
  DeleteSubCommand,
  EditSubCommand,
  ShowSubCommand,
  InfoSubCommand,
  UseSubCommand,
  RawSubCommand,
];

export = {
  Command: defineCommand<ChatInputCommandInteraction>({
    command: {
      name: "tag",
      type: ApplicationCommandType.CHAT_INPUT,
      description: "Create, list, edit, and delete tags!",
      options: subCommands,
    },
    on: async (ctx: Context, interaction) => {
      const subCommand = interaction.options.getSubcommand();

      if (subCommand === "delete") {
        const tag = interaction.options.getString("tag-name");
        const dbTag = await TagGet({ name: tag, guildId: interaction.guild.id, ctx: ctx });

        if (checkForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE) || dbTag.TagAuthor === interaction.user.id) {
          await RunDeleteSubCommand(ctx, interaction);
        } else {
          return interaction.reply({
            content: "Sorry but you can't use this command.",
            ephemeral: true,
          });
        }
      }

      if (checkForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
        switch (subCommand) {
          case 'create':
            await RunCreateSubCommand(ctx, interaction);
            break;
          case 'list':
            await RunListSubCommand(ctx, interaction);
            break;
          case 'edit':
            await RunEditSubCommand(ctx, interaction);
            break;
          case 'show':
            await RunShowSubCommand(ctx, interaction);
            break;
          case 'info':
            await RunInfoSubCommand(ctx, interaction);
            break;
          case 'use':
            await RunUseSubCommand(ctx, interaction);
            break;
          case 'raw':
            await RunRawSubCommand(ctx, interaction);
            break;
        }
      } else {
        return interaction.reply({
          content: "Sorry but you can't use this command.",
          ephemeral: true,
        });
      }
      return;
    },
    autocomplete: async (ctx: Context, interaction) => {
      const subCommand = interaction.options.getSubcommand();

      if (!checkForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
        return interaction.respond([]);
      }

      switch (subCommand) {
        case 'use':
          await RunUseSubCommand(ctx, interaction);
          break;
        case 'show':
          await RunShowSubCommand(ctx, interaction);
          break;
        case 'delete':
          await RunDeleteSubCommand(ctx, interaction);
          break;
        case 'info':
          await RunInfoSubCommand(ctx, interaction);
          break;
        case 'raw':
          await RunRawSubCommand(ctx, interaction);
          break;
        default:
          return interaction.respond([]);
      }
    }
  })
};
