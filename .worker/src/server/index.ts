import { verifyKey } from 'discord-interactions';
import { AutoRouter } from 'itty-router';

import { handleCommand } from '../handlers/commands';
import { Env, ServerInstance, VerificationResult } from '../types/server';
import { 
    createNotFoundResponse, 
    createPongResponse, 
    createUnauthorizedResponse 
} from '../utils/responses';

const router = AutoRouter();

router.get('/', (request: Request, env: Env) => {
    return new Response(`👋 ${env.BOT_ID}`);
});

async function verifyDiscordRequest(request: Request, env: Env): Promise<VerificationResult> {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();
    
    const isValidRequest =
        signature &&
        timestamp &&
        (await verifyKey(body, signature, timestamp, env.PUBLIC_KEY ?? ''));

    if (!isValidRequest) {
        return { isValid: false };
    }

    return { 
        interaction: JSON.parse(body),
        isValid: true 
    };
}

router.post('/', async (request: Request, env: Env) => {
    const { interaction, isValid } = await verifyDiscordRequest(request, env);
    if (!isValid || !interaction) {
        return createUnauthorizedResponse();
    }

    if (interaction.type === 1) { // InteractionType.PING
        return createPongResponse();
    }

    return handleCommand(env, interaction);
});

router.all('*', () => createNotFoundResponse());

export const server: ServerInstance = {
    fetch: router.fetch,
    verifyDiscordRequest,
};

export default server;
