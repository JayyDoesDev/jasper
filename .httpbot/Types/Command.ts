import { ICommand } from '@antibot/interactions';
import { APIInteraction } from 'discord-api-types/v10';

export type Command = {
	command: ICommand;
	on: (interaction: APIInteraction) => void;
};
