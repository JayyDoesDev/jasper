import { InteractionResponseType, InteractionResponseFlags } from "discord-interactions";

export class JsonResponse extends Response {
    constructor(body: unknown, init?: ResponseInit) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };
        super(jsonBody, init);
    }
}

export const createPongResponse = (): JsonResponse => new JsonResponse({
    type: InteractionResponseType.PONG
});

export const createMessageResponse = (content: string, ephemeral = false): JsonResponse => new JsonResponse({
    data: {
        content,
        flags: ephemeral ? InteractionResponseFlags.EPHEMERAL : undefined,
    },
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
});

export const createErrorResponse = (message = 'Unknown Type'): JsonResponse => new JsonResponse(
    { error: message },
    { status: 400 }
);

export const createNotFoundResponse = (): Response => new Response(
    'Not Found.',
    { status: 404 }
);

export const createUnauthorizedResponse = (): Response => new Response(
    'Bad request signature.',
    { status: 401 }
);
