import { Nullable } from '../Common/types';

interface EnvToken {
    env: string;
    aliases: string[];
    required?: boolean;
    default?: string;
    validate?: (value: string) => boolean;
}

interface EnvValidationResult {
    status: 'Valid' | 'Invalid' | 'Missing' | 'ValidationFailed';
    env: string;
    message?: string;
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
                    status: 'Missing',
                    env: token.env,
                    message: 'Required variable is not set',
                });
                errors.push(`Missing required environment variable: ${token.env}`);
                continue;
            }

            if (value && token.validate && !token.validate(value)) {
                results.push({
                    status: 'ValidationFailed',
                    env: token.env,
                    message: 'Failed validation check',
                });
                errors.push(`Environment variable ${token.env} failed validation`);
                continue;
            }

            results.push({
                status: value ? 'Valid' : 'Invalid',
                env: token.env,
                message: value ? undefined : 'No value set',
            });
        }

        console.group('Environment Variables Status');
        console.table(
            results.map((r) => ({
                Env: r.env,
                Status: r.status,
                Message: r.message || '',
            })),
        );
        console.groupEnd();

        if (errors.length > 0) {
            throw new Error('Environment validation failed:\n' + errors.join('\n'));
        }
    }
}
