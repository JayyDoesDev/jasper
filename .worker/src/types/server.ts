import { APIInteraction } from 'discord-api-types/v10';

export interface Env {
    BOT_ID?: string;
    BOT_TOKEN?: string;
    PUBLIC_KEY?: string;
}

export interface ServerInstance {
    fetch(request: Request, env: Env): Promise<Response>;
    verifyDiscordRequest(request: Request, env: Env): Promise<VerificationResult>;
}

export interface VerificationResult {
    interaction?: APIInteraction;
    isValid: boolean;
}
