import { Message, ChannelType } from "discord.js";
import { Event, DefineEvent } from "../../Common/DefineEvent";
import { Wrap } from "../../Common/Wrap";
import { Context } from "../../Context";
import TagSchema from "../../Models/TagSchema";
import { TagGet } from "../Controllers/TagGet";
import type { Snowflake } from "@antibot/interactions";

export const TagEvent: Event = DefineEvent({
  event: {
    name: "messageCreate",
    once: false
  },
  on: async (message: Message) => {
    try {
      if (message.author.bot) {
        return;
      }
      if (message.channel.type == ChannelType.DM) {
        return;
      }
      const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
      const tagname: string = args.shift().toLowerCase();
      const actions: string[] = [];
      const parameters: Record<string, string> = {};
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('-')) {
          const action = arg;
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            parameters[action] = nextArg;
            i++;
          } else {
            actions.push(action);
          }
        } else {
          return;
        }
      }
      if (tagname) {
        if (checkForRoles(message, process.env.ADMIN_ROLE) ||
          checkForRoles(message, process.env.STAFF_ROLE) ||
          checkForRoles(message, process.env.SUPPORT_ROLE)
        ) {
          const wrappedTag = await Wrap(TagGet(tagname, message.guild.id));
          if ('TagName' in wrappedTag.data) {
            const embedObject: any = {};
            wrappedTag.data.TagEmbedDescription ? Object.defineProperty(embedObject, "description", { value: wrappedTag.data.TagEmbedDescription }) : Object.defineProperty(embedObject, "description", { value: null });
            wrappedTag.data.TagEmbedFooter ? Object.defineProperty(embedObject, "footer", { value: { text: wrappedTag.data.TagEmbedFooter } }) : Object.defineProperty(embedObject, "footer", { value: null });
            const reply = {
              content: null,
              embeds: [
                {
                  title: wrappedTag.data.TagEmbedTitle,
                  color: 0xff9a00,
                  description: embedObject?.description,
                  footer: embedObject?.footer
                }
              ]
            };
            if (actions.includes('-msg') || actions.includes('-m') || parameters['-msg'] || parameters['-m']) {
              reply.content =
                parameters['-msg'].includes("@everyone") || parameters['-msg'].includes("@here") ? null : parameters['-msg'];
            }
            if (actions.includes('-del') || actions.includes('-d') || parameters['-del'] || parameters['-d']) {
              await message.channel.send(reply);
              try {
                await message.delete();
              } catch (e) {
                return;
              }
            } else {
              return message.reply(reply);
            }
          } else {
            return;
          }
        } else {
          return;
        }
      } else {
        return;
      }
    } catch (error) {
      return;
    }

    function checkForRoles(r: Message, role: Snowflake): boolean {
      const roles = r.member.roles.valueOf();
      const convertToArray: string[] = Array.from(roles as any);
      let response: boolean;
      for (let i = 0; i < convertToArray.length; i++) {
        if (convertToArray[i][0].includes(role)) {
          response = true;
          break;
        };
      };
      return response;
    }
  }
}) as Event;
