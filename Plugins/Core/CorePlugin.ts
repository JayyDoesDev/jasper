import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { DefineEvent } from "../../Common/DefineEvent";
import { ActivityType, ChatInputCommandInteraction } from "discord.js";
import { Command, DefineCommand } from "../../Common/DefineCommand";
import {
  ApplicationCommandType,
  PermissionsToHuman,
  PlantPermission,
  Permissions,
  PermissionBitToString
} from "@antibot/interactions";
import { PingCommand } from "../../Javascript/CoreCommands";
import numeral from "numeral";
import { Context } from "../../Context";
export = DefinePlugin({
  name: "Core",
  description: "Core process.",
  commands: [
    DefineCommand({
      command: {
        name: "secret",
        type: ApplicationCommandType.CHAT_INPUT,
        description: "nothing to see here",
        default_member_permissions: PermissionBitToString(Permissions({ Administrator: true })),
        options: [],
      },
      on: (ctx: Context, interaction: ChatInputCommandInteraction) => {
        return interaction.reply({
          embeds: [
            {
              title: "Secret",
              description: `**• Commands:** ${Array.from(ctx.interactions).map((x) => x[1].command.name).join(", ")}\n**• Permissions:** ${PermissionsToHuman(interaction.appPermissions.bitfield).join(", ")} `,
              color: 0xff9a00
            }
          ],
          ephemeral: true
        })
      }
    }),
    PingCommand
  ],
  events: [
    DefineEvent({
      event: {
        name: "ready",
        once: true,
      },
      on: (ctx: Context) => {
        if (process.env.SUB_COUNT_UPDATE == "1") {
          (async () => {
            const data = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${process.env.YOUTUBE_CHANNEL_ID}&key=${process.env.YOUTUBE_KEY}`);
            data.json().then((x) => {
              const subscriberCount: string = numeral(x.items[0].statistics.subscriberCount).format('0.00a');
              ctx.channels.cache.get(process.env.SUB_COUNT_CHANNEL)
                //@ts-ignore
                .setName(`\u{1F4FA} \u{FF5C} Sub Count: ${subscriberCount}`);
            });
          })()
        }
        console.log(`${ctx.user.username} has logged in!`);
        ctx.user.setPresence({
          activities: [
            {
              type: ActivityType.Custom,
              name: "custom",
              state: "jasper"
            }
          ]
        });
      },
    }),
    DefineEvent({
      event: {
        name: "interactionCreate",
        once: false,
      },
      on: (interaction, ctx) => {
        if (!interaction.isCommand()) {
          return;
        }
        const command: Command = ctx.interactions.get(interaction.commandName);
        if (command) {
          if (command.permissions) {
            const perms: any[] = [];
            let permDisplay: string = "";
            if (!interaction.appPermissions.has(command.permissions)) {
              for (let i = 0; i < command.permissions.length; i++) {
                perms.push(
                  PermissionsToHuman(PlantPermission(command.permissions[i]))
                );
              }
              if (perms.length <= 2) {
                permDisplay = perms.join(" & ");
              } else {
                permDisplay = perms.join(", ");
              }
              return interaction.reply({
                content: `I'm missing permissions! (${permDisplay})`,
                ephemeral: true
              });
            }
          }

          command.on(ctx, interaction);
        }
      },
    }),
    DefineEvent({
      event: {
        name: "error",
        once: false
      },
      on: (e) => {
        console.log(`Error: ${e}\nMethod: ${e.method}\nUrl: ${e.url} `);
      }
    })
  ],
  public_plugin: true
}) as Plugin;
