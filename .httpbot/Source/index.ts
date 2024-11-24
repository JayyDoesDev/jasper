import { AutoRouter, IRequest } from "itty-router"
import { InteractionType, verifyKey, InteractionResponseType } from "discord-interactions";
import { config } from "dotenv";
config({ path: '.development.local' });
const router = AutoRouter();

type Interaction = { type: InteractionType; }
type ENV = { PUBLIC_KEY: string; }

async function verifyDiscordRequest(request: IRequest, env: ENV): Promise<{ interaction?: Interaction; isValid: boolean; }> {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();
	const isValidRequest =
	  signature &&
	  timestamp &&
	  (await verifyKey(body, signature, timestamp, env.PUBLIC_KEY));
	if (!isValidRequest) {
	  return { isValid: false };
	}
  
	return { interaction: JSON.parse(body), isValid: true };
}

function respond(o: Object): Response {
	return new Response(JSON.stringify(o));
}

router.get("/", () => new Response("Hello World!"));

router.post("/interactions", async (r: IRequest, env) => {
	const { isValid, interaction } = await server.verifyDiscordRequest(r, env);
	if (!isValid) {
	  return new Response("Invalid request", { status: 401 });
	}

	if (interaction) {
		switch (interaction.type) {
			case InteractionType.PING: {
				return respond({ type: InteractionResponseType.PONG });
			};
			case InteractionType.APPLICATION_COMMAND: {
				return respond({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: "Hello World!" } });
			}
		}
	}
});
const server = { verifyDiscordRequest, fetch: router.fetch };


export default server;