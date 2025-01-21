import { ApplicationCommandOptions, ApplicationCommandType, } from "@antibot/interactions";
import { defineCommand } from "../../../Common/define";
import { Context } from "../../../Source/Context";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import {
  CreateSubCommand,
  DeleteSubCommand,
  EditSubCommand,
  InfoSubCommand,
  ListSubCommand,
  ShowSubCommand,
  UseSubCommand,
  RawSubCommand,
  create,
  del,
  edit,
  info,
  list,
  show,
  use,
  raw
} from "../SubCommands";
import { checkForRoles } from "../../../Common/roles";
import { Options } from "../../../Services/TagService";

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
        const guildId = interaction.user.id;
        const name = interaction.options.getString("tag-name");
        
        await ctx.services.tags.configure<Options>({ guildId, name });

        if (checkForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE)) {
          await del(ctx, interaction);
        } else {
          return interaction.reply({ content: "Sorry but you can't use this command.", flags: MessageFlags.Ephemeral, });
        }
      }

      if (checkForRoles(interaction, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
        switch (subCommand) {
          case 'create':
            await create(ctx, interaction);
            break;
          case 'list':
            await list(ctx, interaction);
            break;
          case 'edit':
            await edit(ctx, interaction);
            break;
          case 'show':
            await show(ctx, interaction);
            break;
          case 'info':
            await info(ctx, interaction);
            break;
          case 'use':
            await use(ctx, interaction);
            break;
          case 'raw':
            await raw(ctx, interaction);
            break;
        }
      } else {
        return interaction.reply({ content: "Sorry but you can't use this command.", flags: MessageFlags.Ephemeral, });
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
          await use(ctx, interaction);
          break;
        case 'show':
          await show(ctx, interaction);
          break;
        case 'delete':
          await del(ctx, interaction);
          break;
        case 'info':
          await info(ctx, interaction);
          break;
        case 'raw':
          await raw(ctx, interaction);
          break;
        default:
          return interaction.respond([]);
      }
    }
  })
};
