import { APIInteraction } from 'discord-api-types/v10';
import { ICommand } from '@antibot/interactions';

export type Command = {
	command: ICommand;
	on: (interaction: APIInteraction) => void;
};
