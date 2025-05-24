import { commands } from '../commands/registry';

interface DiscordError {
    code: number;
    message: string;
}

class RegistrationError extends Error {
    constructor(message: string, public readonly details?: string) {
        super(message);
        this.name = 'RegistrationError';
    }
}

export async function register(env: {
    BOT_ID?: string;
    BOT_TOKEN?: string;
}): Promise<void> {
    const { BOT_ID: applicationId, BOT_TOKEN: token } = env;

    if (!token) {
        throw new RegistrationError('The BOT_TOKEN environment variable is required.');
    }
    if (!applicationId) {
        throw new RegistrationError('The BOT_ID environment variable is required.');
    }

    const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
    
    const response = await fetch(url, {
        body: JSON.stringify(commands),
        headers: {
            'Authorization': `Bot ${token}`,
            'Content-Type': 'application/json',
        },
        method: 'PUT',
    });
    
    if (response.ok) {
        console.log('Registered all commands');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
        return;
    }

    let errorText = `Error registering commands\n${response.url}: ${response.status} ${response.statusText}`;
    try {
        const error = await response.json() as DiscordError;
        if (error.message) {
            errorText = `${errorText}\n\nDiscord Error: ${error.message} (Code: ${error.code})`;
        }
    } catch {
        try {
            const text = await response.text();
            if (text) {
                errorText = `${errorText}\n\n${text}`;
            }
        } catch (err) {
            console.error('Error reading body from request:', err);
        }
    }

    throw new RegistrationError('Failed to register commands', errorText);
}
