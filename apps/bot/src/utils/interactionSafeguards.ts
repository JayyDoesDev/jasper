import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    InteractionReplyOptions,
    InteractionResponse,
    MessageCreateOptions,
    MessageEditOptions,
    MessageFlags,
} from 'discord.js';

type Repliable = ChatInputCommandInteraction | ContextMenuCommandInteraction;

export async function safeAutocompleteRespond(
    interaction: AutocompleteInteraction,
    choices: Array<{ name: string; value: string }>,
): Promise<void> {
    try {
        await interaction.respond(choices);
    } catch (err) {
        if (isUnknownInteractionError(err)) return; // ignore late responses
        console.error('[safeAutocompleteRespond] Failed to respond:', err);
        try {
            await interaction.respond([]);
        } catch {
            /* ignore */
        }
    }
}

export async function safeDeferReply(
    interaction: Repliable,
    options?: { ephemeral?: boolean; flags?: number },
): Promise<InteractionResponse<boolean> | void> {
    try {
        if (interaction.deferred || interaction.replied) return;

        // Prefer flags for ephemeral to avoid deprecation warnings
        const flags = options?.flags ?? (options?.ephemeral ? MessageFlags.Ephemeral : undefined);
        return await interaction.deferReply(flags != null ? { flags } : undefined);
    } catch (err) {
        if (isUnknownInteractionError(err)) return; // The interaction expired; ignore
        if (isAlreadyRepliedError(err)) return; // Someone else replied; ignore
        console.error('[safeDeferReply] Failed to defer interaction:', err);
    }
}

export async function safeReply(
    interaction: Repliable,
    options: InteractionReplyOptions | MessageCreateOptions | MessageEditOptions | string,
): Promise<void> {
    try {
        if (interaction.deferred) {
            await interaction.editReply(options as MessageEditOptions);
            return;
        }
        if (!interaction.replied) {
            await interaction.reply(options as InteractionReplyOptions);
            return;
        }
        await interaction.followUp(options as InteractionReplyOptions);
    } catch (err) {
        if (isUnknownInteractionError(err)) return; // Too late to reply
        if (isAlreadyRepliedError(err)) {
            try {
                await interaction.followUp(options as InteractionReplyOptions);
            } catch (followErr) {
                if (!isUnknownInteractionError(followErr)) {
                    console.error('[safeReply] followUp failed:', followErr);
                }
            }
            return;
        }
        console.error('[safeReply] Failed to send interaction response:', err);
    }
}

function isAlreadyRepliedError(err: unknown): boolean {
    const e = err as null | { code?: unknown; message?: unknown };
    const code = (e && typeof e.code !== 'undefined' ? e.code : undefined) as unknown;
    const msg = (e && typeof e.message !== 'undefined' ? String(e.message) : '') as string;
    return code === 'InteractionAlreadyReplied' || /already been sent or deferred/i.test(msg);
}

function isUnknownInteractionError(err: unknown): boolean {
    const e = err as null | { code?: unknown; message?: unknown; rawError?: { code?: unknown } };
    const code = (e && typeof e.code !== 'undefined' ? e.code : undefined) as unknown;
    const rawCode = (
        e && e.rawError && typeof e.rawError.code !== 'undefined' ? e.rawError.code : undefined
    ) as unknown;
    const msg = (e && typeof e.message !== 'undefined' ? String(e.message) : '') as string;
    return code === 10062 || rawCode === 10062 || /Unknown interaction/i.test(msg);
}
