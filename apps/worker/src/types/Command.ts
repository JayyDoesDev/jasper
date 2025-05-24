import { APIApplicationCommandOption, APIChatInputApplicationCommandInteraction, APIInteractionResponse, ApplicationIntegrationType, InteractionContextType } from 'discord-api-types/v10';
import { JsonResponse } from 'src/utils/responses';

import { Env } from './server';

export interface Command {
    contexts?: InteractionContextType[];
    default_member_permissions?: string;
    description: string;
    dm_permission?: boolean;
    handler?: (env: Env, interaction: APIChatInputApplicationCommandInteraction) => Promise<JsonResponse>;
    integration_types?: ApplicationIntegrationType[];
    name: string;
    options?: APIApplicationCommandOption[];
}
