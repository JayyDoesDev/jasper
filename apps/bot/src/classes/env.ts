import { Nullable } from '../types';

interface EnvToken {
    aliases: string[];
    default?: string;
    env: string;
    required?: boolean;
    validate?: (value: string) => boolean;
}

interface EnvValidationResult {
    env: string;
    message?: string;
    status: 'Invalid' | 'Missing' | 'Valid' | 'ValidationFailed';
}

export class Env {
    #tokens: EnvToken[];

    constructor(...tokens: EnvToken[]) {
        this.#tokens = tokens;
    }

    public get<T extends string, R = string>(env: T): Nullable<R> {
        const matchingToken = this.#tokens.find((t) => t.env === env || t.aliases.includes(env));

        if (!matchingToken) {
            return null;
        }

        const value = process.env[matchingToken.env] || matchingToken.default;

        if (!value && matchingToken.required) {
            throw new Error(`Required environment variable ${matchingToken.env} is not set`);
        }

        return value as Nullable<R>;
    }

    public validate(): void {
        const results: EnvValidationResult[] = [];
        const errors: string[] = [];

        for (const token of this.#tokens) {
            const value = this.get<string, string>(token.env);

            if (!value && token.required) {
                results.push({
                    env: token.env,
                    message: 'Required variable is not set',
                    status: 'Missing',
                });
                errors.push(`Missing required environment variable: ${token.env}`);
                continue;
            }

            if (value && token.validate && !token.validate(value)) {
                results.push({
                    env: token.env,
                    message: 'Failed validation check',
                    status: 'ValidationFailed',
                });
                errors.push(`Environment variable ${token.env} failed validation`);
                continue;
            }

            results.push({
                env: token.env,
                message: value ? undefined : 'No value set',
                status: value ? 'Valid' : 'Invalid',
            });
        }

        console.group('Environment Variables Status');
        console.table(
            results.map((r) => ({
                Env: r.env,
                Message: r.message || '',
                Status: r.status,
            })),
        );
        console.groupEnd();

        if (errors.length > 0) {
            throw new Error('Environment validation failed:\n' + errors.join('\n'));
        }
    }
}
