/* eslint @typescript-eslint/no-explicit-any: "off" */
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Collection,
    ContextMenuCommandInteraction,
    Message,
    Role,
} from 'discord.js';
import type { Snowflake } from '@antibot/interactions';

type Interaction =
    | ChatInputCommandInteraction
    | ContextMenuCommandInteraction
    | AutocompleteInteraction
    | Message;

export function checkForRoles(interaction: Interaction, ...roles: Snowflake[]): boolean {
    const rroles = <Collection<string, Role>>interaction.member.roles.valueOf();

    const convertToArray: string[] = Array.from<any>(rroles);

    let response: boolean = false;

    for (let rrolesIndex = 0; rrolesIndex < convertToArray.length; rrolesIndex++) {
        for (let rolesIndex = 0; rolesIndex < roles.length; rolesIndex++) {
            if (convertToArray[rrolesIndex][0].includes(roles[rolesIndex])) {
                response = true;
                break;
            }
        }
    }
    return response;
}
