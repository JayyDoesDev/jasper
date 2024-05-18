import { ChatInputCommandInteraction, Message } from "discord.js";
import type { Snowflake } from "@antibot/interactions";

export function CheckForRoles(i: ChatInputCommandInteraction | Message, ...roles: Snowflake[]): boolean {
  const rroles = i.member.roles.valueOf();
  const convertToArray: string[] = Array.from(rroles as any);
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
