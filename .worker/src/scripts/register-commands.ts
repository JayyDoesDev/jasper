import 'dotenv/config';
import { register } from '../utils/register';
import { Env } from '../types/server';

async function registerCommands(): Promise<void> {
    try {
        const env: Env = {
            BOT_TOKEN: process.env.BOT_TOKEN || process.env.TOKEN,
            BOT_ID: process.env.BOT_ID || process.env.BOTID,
            PUBLIC_KEY: process.env.PUBLIC_KEY || process.env.PUBLICKEY
        };
        
        await register(env);
        console.log('Commands registration complete');
    } catch (error) {
        console.error('Failed to register commands:', error);
        
        if (error instanceof Error) {
            console.error(error.message);
            if ('details' in error) {
                console.error(error.details);
            }
        }
        
        process.exit(1);
    }
}

// Only run if this is the main module
if (require.main === module) {
    registerCommands();
}

export { registerCommands };
