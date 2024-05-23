import { Message, ChannelType } from "discord.js";
import { Event, DefineEvent } from "../../Common/DefineEvent";
import { Wrap } from "../../Common/Wrap";
import { TagGet } from "../Controllers/TagGet";
import { CheckForRoles } from "../../Common/CheckForRoles";

export const TagEvent: Event = DefineEvent({
  event: {
    name: "messageCreate",
    once: false
  },
  on: async (message: Message) => {
    try {
      const prefixes: string[] = [process.env.PREFIX, "yo", "w", "dude,", "omg"];
      if (message.author.bot) {
        return;
      }
      if (message.channel.type == ChannelType.DM) {
        return;
      }
      let prefixUsed: string | null = null;
      for (const prefix of prefixes) {
        if (message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
          prefixUsed = prefix;
          break;
        }
      }
      if (!prefixUsed) {
        return;
      }
      const args = message.content.slice(prefixUsed.length).trim().split(/ +/g);
      const tagname: string | undefined = args.shift()?.toLowerCase();
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
        if (CheckForRoles(message, process.env.ADMIN_ROLE, process.env.STAFF_ROLE, process.env.SUPPORT_ROLE)) {
          const wrappedTag = await Wrap(TagGet(tagname, message.guild.id));
          if ('TagName' in wrappedTag.data) {
            const embedObject: any = {};
            wrappedTag.data.TagEmbedDescription ? Object.defineProperty(embedObject, "description", { value: wrappedTag.data.TagEmbedDescription }) : Object.defineProperty(embedObject, "description", { value: null });
            wrappedTag.data.TagEmbedFooter ? Object.defineProperty(embedObject, "footer", { value: { text: wrappedTag.data.TagEmbedFooter } }) : Object.defineProperty(embedObject, "footer", { value: null });
            const reply: {
              content?: null | string,
              embeds:
              {
                title: string | null,
                color: number,
                description: string | null,
                footer: { text: string, value: string }
              }[]
            } = {
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
            const mentionActions: string | true = (actions.includes('-mention') || parameters['-mention']) || (actions.includes('-m') || parameters['-m']);
            const deleteActions: string | true = (actions.includes('-del') || parameters['-del']) || (actions.includes('-d') || parameters['-d']);
            const mentionParameters: string = (parameters['-mention'] || parameters['-m']);
            if (mentionActions) {
              await message.guild.members.fetch({ user: mentionParameters }).then(() => true).catch(() => false)
                ? reply.content =
                mentionParameters.includes("@everyone") || mentionParameters.includes("@here")
                  || mentionParameters.includes("720820224877789204")
                  ? null : `<@${mentionParameters}>`
                : reply.content = null;
            }
            if (deleteActions) {
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
  }
}) as Event;
