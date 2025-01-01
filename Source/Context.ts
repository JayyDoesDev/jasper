import { ActivityType, ChatInputCommandInteraction, Client, ContextMenuCommandInteraction, IntentsBitField, Partials } from "discord.js";
import { ZillaCollection } from "@antibot/zilla";
import { Command } from "../Common/DefineCommand";
import { Interactions, Snowflake } from "@antibot/interactions";
import { Plugin } from "../Common/DefinePlugin";
import { Store } from "./Store";
import { State } from "../Plugins/types";
import { Env } from "./Env";
import path from "path";
import TagController from "../Controllers/TagController";


class Controllers {
    public readonly tags: TagController;
    constructor(public ctx: Context) {
        this.tags = new TagController(ctx);
    }
}

export class Context extends Client {
    public readonly plugin!: ZillaCollection<string, Plugin>;
    public readonly interactions!: ZillaCollection<string, Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>>;
    public readonly interact!: Interactions;
    public readonly pagination!: ZillaCollection<Snowflake, State>;
    public readonly env!: Env;
    public readonly store!: Store;
    public readonly controllers!: Controllers;

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
                parse: ["users"],
            },
            presence: {
                activities: [
                    {
                        name: "Latest Video",
                        state: "subscrib 4 a kis",
                        url: `https://www.youtube.com/watch?v=${require(path.join(process.cwd(), "latestvideo.json")).video}`,
                        type: ActivityType.Streaming
                    }
                ]
            }
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
            { env: "YOUTUBE_CHANNEL_ID", aliases: ["youtube_id", "youtube_channel_id", "youtube"] },
            { env: "YOUTUBE_KEY", aliases: ["youtube_key_regular", "youtube_key_one"] },
            { env: "YOUTUBE_KEY_TWO", aliases: ["youtube_key_two"] },
            { env: "YOUTUBE_KEY_THREE", aliases: ["youtube_key_three"] },
            { env: "YOUTUBE_VIDEO_POST_CHANNEL_ID", aliases: ["youtube_video_post_channel_id", "youtube_post_channel", "youtube_video_post_channel"] },
            { env: "YOUTUBE_VIDEO_POST_TIMER", aliases: ["youtube_video_post_timer", "youtube_post_timer"] },
            { env: "YOUTUBE_VIDEO_POST_UPDATE", aliases: ["youtube_video_post_update", "youtube_post_update"] },
            { env: "YOUTUBE_VIDEO_DISCUSSIONS_ROLE_ID", aliases: ["youtube_video_discussions_role_id", "youtube_video_discussions_role", "youtube_video_disscussions"] },
            { env: "SUB_COUNT_CHANNEL", aliases: ["sub_count_channel"] },
            { env: "SUB_COUNT_TIMER", aliases: ["sub_count_time", "sub_timer", "sub_count_time"] },
            { env: "SUB_COUNT_UPDATE", aliases: ["sub_count_update", "sub_update"] },
            { env: "REDISHOST", aliases: ["redis_host", "redishost"] },
            { env: "REDISPORT", aliases: ["redis_port", "redisport"] },
            { env: "SUPPORT_THREAD", aliases: ["support_thread", "supporthread"] },
            { env: "SLOWMODE", aliases: ["slowmode"] },
            { env: "SLOWMODE_CHANNEL_ID", aliases: ["slowmode_channel"] },
            { env: "SLOWMODE_COOLDOWN", aliases: ["slowmode_cooldown"] },
            { env: "SLOWMODE_MESSAGE_TIME", aliases: ["slowmode_msg_time", "slowmode_message_time"] },
            { env: "SLOWMODE_MESSAGE_THRESHOLD", aliases: ["slowmode_msg_threshold"] },
            { env: "SLOWMODE_RESET_SLOWMODE", aliases: ["slowmode_reset_slowmode"] },
            { env: "SLOWMODE_RESET_TIME", aliases: ["slowmode_reset_time"] }
        );
        this.store = new Store(this);
        this.controllers = new Controllers(this);
    }
}
