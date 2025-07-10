import { Interactions, Snowflake } from '@antibot/interactions';
import { ZillaCollection } from '@antibot/zilla';
import {
    ActivityType,
    ChatInputCommandInteraction,
    Client,
    ContextMenuCommandInteraction,
    IntentsBitField,
    Message,
    Partials,
} from 'discord.js';

import { Command, Plugin } from '../define';
import { State } from '../plugins/types';
import InactiveThreadsService from '../services/inactiveThreadsService';
import SettingsService from '../services/settingsService';
import TagService from '../services/tagService';

import { Env } from './env';
import { Store } from './store';
import WebServer from './webserver';

class Services {
    public readonly inactiveThreads: InactiveThreadsService;
    public readonly settings: SettingsService;
    public readonly tags: TagService;
    constructor(public ctx: Context) {
        this.tags = new TagService(ctx);
        this.settings = new SettingsService(ctx);
        this.inactiveThreads = new InactiveThreadsService(ctx);
    }
}

export class Context extends Client {
    public readonly env!: Env;
    public readonly interact!: Interactions;
    public readonly interactions!: ZillaCollection<
        string,
        Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>
    >;
    public readonly pagination!: ZillaCollection<Snowflake, State>;
    public readonly plugin!: ZillaCollection<string, Plugin>;
    public readonly services!: Services;
    public readonly snipe!: ZillaCollection<Snowflake, Message>;
    public readonly store!: Store;
    public readonly webserver: WebServer = new WebServer(this);

    constructor() {
        super({
            allowedMentions: {
                parse: ['users'],
            },
            intents: [
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.User,
                Partials.Reaction,
            ],
            presence: {
                activities: [
                    {
                        name: '/help',
                        state: 'Working with support and handling slowmode',
                        type: ActivityType.Streaming,
                        url: `https://www.youtube.com/watch?v=avideothatdoesntexist`,
                    },
                ],
                status: 'dnd',
            },
        });
        this.plugin = new ZillaCollection<string, Plugin>();
        this.interactions = new ZillaCollection<
            string,
            Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>
        >();
        this.interact = new Interactions({
            botID: process.env.BOTID as unknown as Snowflake,
            botToken: process.env.TOKEN as unknown as string,
            debug: true,
            publicKey: process.env.PUBLICKEY as unknown as string,
        });
        this.pagination = new ZillaCollection<Snowflake, State>();
        this.snipe = new ZillaCollection<Snowflake, Message<true>>();
        this.env = new Env(
            { aliases: ['bot_id', 'botid'], env: 'BOTID' },
            { aliases: ['public_key', 'publickey'], env: 'PUBLICKEY' },
            { aliases: ['botToken', 'token', 'bot'], env: 'TOKEN' },
            { aliases: ['db'], env: 'MONGODB' },
            { aliases: ['prefix'], env: 'PREFIX' },
            { aliases: ['guild_only_commands', 'guild_only'], env: 'GUILD_ONLY_COMMANDS' },
            {
                aliases: ['guild_only_commands_guild_id', 'guild_only_commands_id'],
                env: 'GUILD_ONLY_COMMANDS_GUILD_ID',
            },
            { aliases: ['youtube_id', 'youtube_channel_id', 'youtube'], env: 'YOUTUBE_CHANNEL_ID' },
            {
                aliases: ['youtube_post_channel', 'youtube_post'],
                env: 'YOUTUBE_VIDEO_POST_CHANNEL',
            },
            {
                aliases: ['youtube_video_post_timer', 'youtube_post_timer'],
                env: 'YOUTUBE_VIDEO_POST_TIMER',
            },
            {
                aliases: ['youtube_video_post_update', 'youtube_post_update'],
                env: 'YOUTUBE_VIDEO_POST_UPDATE',
            },
            { aliases: ['sub_count_channel'], env: 'SUB_COUNT_CHANNEL' },
            { aliases: ['sub_count_time', 'sub_timer', 'sub_count_time'], env: 'SUB_COUNT_TIMER' },
            { aliases: ['sub_count_update', 'sub_update'], env: 'SUB_COUNT_UPDATE' },
            { aliases: ['redis_host', 'redishost'], env: 'REDISHOST' },
            { aliases: ['redis_port', 'redisport'], env: 'REDISPORT' },
            { aliases: ['slowmode'], env: 'SLOWMODE' },
            { aliases: ['slowmode_cooldown'], env: 'SLOWMODE_COOLDOWN' },
            {
                aliases: ['slowmode_msg_time', 'slowmode_message_time'],
                env: 'SLOWMODE_MESSAGE_TIME',
            },
            { aliases: ['slowmode_msg_threshold'], env: 'SLOWMODE_MESSAGE_THRESHOLD' },
            { aliases: ['slowmode_reset_slowmode'], env: 'SLOWMODE_RESET_SLOWMODE' },
            { aliases: ['slowmode_reset_time'], env: 'SLOWMODE_RESET_TIME' },
            { aliases: ['jasper_api_url'], env: 'JASPER_API_URL' },
            { aliases: ['jasper_api_key'], env: 'JASPER_API_KEY' },
        );
        this.webserver = new WebServer(this);
        this.store = new Store(this);
        this.services = new Services(this);
    }
}
