import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction, IntentsBitField, Partials } from "discord.js";
import { ZillaCollection } from "@antibot/zilla";
import { Command } from "../Common/DefineCommand";
import { Interactions, Snowflake } from "@antibot/interactions";
import { Plugin } from "../Common/DefinePlugin";
import { Store } from "./Store";
import { State } from "../Plugins/types";
import { Env } from "./Env";

export class Context extends Client {
    public plugin: ZillaCollection<string, Plugin>;
    public interactions: ZillaCollection<string, Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>>;
    public interact: Interactions;
    public pagination: ZillaCollection<Snowflake, State>;
    public env: Env;
    public store: Store;

    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.User,
            ],
            allowedMentions: {
                parse: [ "users" ],
            },
        });
        this.plugin = new ZillaCollection<string, Plugin>();
        this.interactions = new ZillaCollection<string, Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>>();
        this.interact = new Interactions({
            publicKey: process.env.PUBLICKEY as unknown as string,
            botID: process.env.BOTID as unknown as Snowflake,
            botToken: process.env.TOKEN as unknown as string,
            debug: true,
        });
        this.pagination = new ZillaCollection<Snowflake, State>();
        this.env = new Env(
          { env: "BOTID", aliases: ["bot_id", "botid"] },
          { env: "PUBLICKEY", aliases: ["public_key", "publickey"] },
          { env: "TOKEN", aliases: ["botToken", "token", "bot"] },
          { env: "MONGODB", aliases: ["db"] },
          { env: "PREFIX", aliases: ["prefix"] },
          { env: "SUPPORT_ROLE", aliases: ["support_role", "supportrole", "support"] },
          { env: "ADMIN_ROLE", aliases: ["admin_role", "adminrole", "admin"] },
          { env: "STAFF_ROLE", aliases: ["staff_role", "staffrole", "staff"] },
          { env: "GUILD_ONLY_COMMANDS", aliases: ["guild_only_commands", "guild_only"] },
          { env: "GUILD_ONLY_COMMANDS_GUILD_ID", aliases: ["guild_only_commands_guild_id", "guild_only_commands_id"] },
          { env: "YOUTUBE_CHANNEL_ID", aliases: ["youtube_id", "youtube_channel_id", "youtube"]},
          { env: "YOUTUBE_KEY", aliases: ["youtube_key_regular"] },
          { env: "SUB_COUNT_CHANNEL", aliases: ["sub_count_channel"] },
          { env: "SUB_COUNT_TIMER", aliases: ["sub_count_time", "sub_timer", "sub_count_time"] },
          { env: "SUB_COUNT_UPDATE", aliases: ["sub_count_update", "sub_update"] },
          { env: "REDISHOST", aliases: ["redis_host", "redishost"] },
          { env: "REDISPORT", aliases: ["redis_port", "redisport"] },
          { env: "SUPPORT_THREAD", aliases: ["support_thread", "supporthread"] }
      );
      this.store = new Store(this);
    }
}
