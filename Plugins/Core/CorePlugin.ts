import { DefinePlugin, Plugin } from "../../Common/DefinePlugin";
import { DefineEvent } from "../../Common/DefineEvent";
import { ChannelType } from "discord.js";
import { Command, DefineCommand } from "../../Common/DefineCommand";
import { ApplicationCommandType, PermissionsToHuman, PlantPermission } from "@antibot/interactions";

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
	],
	public_plugin: false
}) as Plugin;
