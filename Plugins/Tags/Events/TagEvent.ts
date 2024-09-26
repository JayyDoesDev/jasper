import { Message } from "discord.js";
import { DefineEvent } from "../../../Common/DefineEvent";
import { Wrap } from "../../../Common/Wrap";
import { TagGet } from "../Controllers/TagGet";
import { CheckForRoles } from "../../../Common/CheckForRoles";
import { Context } from "../../../Source/Context";
import { Nullable } from "../../../Common/Nullable";
import { Combine } from "../../../Common/Combine";
import { TagOptions } from "../Controllers/Types";

export = {
  Event: DefineEvent({
    event: {
        name: "messageCreate",
        once: false
    },
    on: async (message: Message, ctx: Context) => {
        try {
            if (!message.channel.isThread()) {
              return;
            }
            if (message.channel.parentId !== String(ctx.env.get("support_thread"))) {
                return;
            }
            const prefixes: string[] = [ ctx.env.get("prefix"), "yo", "w", "dude,", "omg", "lookhere", "j" ];
            if (message.author.bot) {
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
                if (CheckForRoles(message, ctx.env.get("admin"), ctx.env.get("staff"), ctx.env.get("support"))) {
                    const wrappedTag = await Wrap(TagGet({ name: tagname, guildId: message.guild.id, ctx: ctx }));
                    if ('TagName' in wrappedTag.data) {
                        const embedObject: Partial<Combine<[Omit<TagOptions, "footer">, Record<"footer", { text: string, value: string }>]>> = {};
                        wrappedTag.data.TagEmbedDescription ? Object.defineProperty(embedObject, "description", { value: wrappedTag.data.TagEmbedDescription }) : Object.defineProperty(embedObject, "description", { value: null });
                        wrappedTag.data.TagEmbedFooter ? Object.defineProperty(embedObject, "footer", { value: { text: wrappedTag.data.TagEmbedFooter } }) : Object.defineProperty(embedObject, "footer", { value: null });
                        const reply: {
                            content?: Nullable<string>,
                            embeds:
                                {
                                    title: Nullable<string>,
                                    color: number,
                                    description: Nullable<string>,
                                    footer: { text: string, value: string }
                                }[]
                        } = {
                            content: null,
                            embeds: [
                                {
                                    title: wrappedTag.data.TagEmbedTitle,
                                    color: global.embedColor,
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
                                        ? null : `<@${ mentionParameters }>`
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
  })
}
