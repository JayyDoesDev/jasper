import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { DefineEvent } from "../../Common/DefineEvent";
import { ChannelType } from "discord.js";
import { Command, DefineCommand } from "../../Common/DefineCommand";
import { ApplicationCommandType, PermissionsToHuman, PlantPermission } from "@antibot/interactions";
import numeral from "numeral";
export = DefinePlugin({
	name: "Core",
	description: "Core process.",
	commands: [],
	events: [
		DefineEvent({
			event: {
				name: "ready",
				once: true,
			},
			on: (ctx) => {
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
							//@ts-ignore
							for (var i = 0; i < command.permissions.length; i++) {
								perms.push(
									PermissionsToHuman(PlantPermission(command.permissions[i]))
								);
							}
							if (perms.length <= 2) {
								permDisplay = perms.join(" & ");
							} else {
								permDisplay = perms.join(", ");
							}
							//@ts-ignore
							return interaction.reply({
								content: `I'm missing permissions! (${permDisplay})`,
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
        console.log(`Error: ${e.rawError.message}\nMethod: ${e.method}\nUrl: ${e.url} `);
      }
    })
	],
	public_plugin: false
}) as Plugin;
