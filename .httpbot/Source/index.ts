import { Interactions } from '@antibot/interactions';
import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { config } from 'dotenv';
import { AutoRouter, IRequest } from 'itty-router';

import { respond } from '../Lib/Respond';

import { commands, handleCommands } from './Commands';

config({ path: '.development.local' });
const router = AutoRouter();

type ENV = { BOT_ID: string; BOT_TOKEN: string; GUILD_ID: string; PUBLIC_KEY: string; };
type Interaction = { type: InteractionType };

async function verifyDiscordRequest(request: IRequest, env: ENV): Promise<{ interaction?: Interaction; isValid: boolean }> {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();
	const isValidRequest = signature && timestamp && (await verifyKey(body, signature, timestamp, env.PUBLIC_KEY));
	if (!isValidRequest) {
		return { isValid: false };
	}

	return { interaction: JSON.parse(body), isValid: true };
}

router.get('/', () => new Response('Hello World!'));
router.post('/interactions', async (r: IRequest, env) => {
	const interactions = new Interactions({ botID: env.BOT_ID, botToken: env.BOT_TOKEN, debug: true, publicKey: env.PUBLIC_KEY });
	const cmds = commands.map((command) => command.command);
	await interactions.overwriteGuildCommands(env.GUILD_ID, ...cmds);

	const { interaction, isValid } = await verifyDiscordRequest(r, env);
	if (!isValid) {
		return new Response('Invalid request', { status: 401 });
	}

	if (interaction) {
		switch (interaction.type) {
			case InteractionType.PING: {
				return respond({ type: InteractionResponseType.PONG });
			}
			case InteractionType.APPLICATION_COMMAND: {
				handleCommands(interaction);
				return new Response('Command handled', { status: 200 });
			}
		}
	}
	return new Response('Unhandled interaction type', { status: 400 });
});

const server = { fetch: router.fetch, verifyDiscordRequest };

export default server;
