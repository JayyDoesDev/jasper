import { PermissionBitToString, Permissions } from '@antibot/interactions';
import {
	APIChatInputApplicationCommandInteraction,
	APIUser,
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	InteractionContextType,
	InteractionResponseType,
} from 'discord-api-types/v10';
import { Command, Env } from 'src/types';
import { createMessageResponse, JsonResponse } from 'src/utils/responses';

export default {
	commands: [
		{
			default_member_permissions: undefined,
			description: 'Drop some cuteness on this channel.',
			dm_permission: true,
			handler: async (env: Env, interaction: APIChatInputApplicationCommandInteraction) => {
				return createMessageResponse('awwww');
			},
			name: 'awwww',
		},
		{
			contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			default_member_permissions: PermissionBitToString(Permissions({ BanMembers: true })),
			description: 'Fake ban someone from the server',
			dm_permission: true,
			handler: (env: Env, interaction: APIChatInputApplicationCommandInteraction) => {
				const options = interaction.data.options ?? [];
				const userOption = options.find((option) => option.name === 'user' && option.type === ApplicationCommandOptionType.User);
				const reasonOption = options.find((option) => option.name === 'reason' && option.type === ApplicationCommandOptionType.String);

				if (!userOption || !('value' in userOption)) {
					return new JsonResponse({
						data: { content: 'User not found', flags: 64 },
						type: InteractionResponseType.ChannelMessageWithSource,
					});
				}

				const userId = userOption.value as string;
				const user: APIUser | undefined = userId ? interaction.data.resolved?.users?.[userId] : undefined;

				if (!user) {
					return new JsonResponse({
						data: { content: 'User not found', flags: 64 },
						type: InteractionResponseType.ChannelMessageWithSource,
					});
				}

				let reason = 'No reason provided';
				if (reasonOption && 'value' in reasonOption) {
					reason = reasonOption.value as string;
				}

				return new JsonResponse({
					data: {
						embeds: [
							{
								color: 0x00ff00,
								description: `*Banned user **${user.username}** for reason: ${reason}*`,
							},
						],
					},
					type: InteractionResponseType.ChannelMessageWithSource,
				});
			},
			integration_types: [ApplicationIntegrationType.UserInstall],
			name: 'ban',
			options: [
				{
					description: 'The user to ban',
					name: 'user',
					required: true,
					type: ApplicationCommandOptionType.User,
				},
				{
					description: 'The reason for the ban',
					name: 'reason',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
		{
			contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			default_member_permissions: PermissionBitToString(Permissions({ KickMembers: true })),
			description: 'Fake kick someone from the server',
			dm_permission: true,
			handler: async (env: Env, interaction: APIChatInputApplicationCommandInteraction) => {
				const options = interaction.data.options ?? [];
				const userOption = options.find((option) => option.name === 'user' && option.type === ApplicationCommandOptionType.User);
				const reasonOption = options.find((option) => option.name === 'reason' && option.type === ApplicationCommandOptionType.String);

				if (!userOption || !('value' in userOption)) {
					return new JsonResponse({
						data: { content: 'User not found', flags: 64 },
						type: InteractionResponseType.ChannelMessageWithSource,
					});
				}

				const userId = userOption.value as string;
				const user: APIUser | undefined = userId ? interaction.data.resolved?.users?.[userId] : undefined;

				if (!user) {
					return new JsonResponse({
						data: { content: 'User not found', flags: 64 },
						type: InteractionResponseType.ChannelMessageWithSource,
					});
				}

				let reason = 'No reason provided';
				if (reasonOption && 'value' in reasonOption) {
					reason = reasonOption.value as string;
				}

				return new JsonResponse({
					data: {
						embeds: [
							{
								color: 0x00ff00,
								description: `*Kicked user **${user.username}** for reason: ${reason}*`,
							},
						],
					},
					type: InteractionResponseType.ChannelMessageWithSource,
				});
			},
			integration_types: [ApplicationIntegrationType.UserInstall],
			name: 'kick',
			options: [
				{
					description: 'The user to kick',
					name: 'user',
					required: true,
					type: ApplicationCommandOptionType.User,
				},
				{
					description: 'The reason for the kick',
					name: 'reason',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
	],
} as Record<'commands', Command[]>;
