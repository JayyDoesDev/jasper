import { APIApplicationCommandOption } from 'discord-api-types/v10';

export interface Command {
    default_member_permissions?: string;
    description: string;
    dm_permission?: boolean;
    name: string;
    options?: APIApplicationCommandOption[];
}
