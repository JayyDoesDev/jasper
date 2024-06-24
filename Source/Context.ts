import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction, IntentsBitField, Partials } from "discord.js";
import { ZillaCollection } from "@antibot/zilla";
import { Command } from "../Common/DefineCommand";
import { Interactions, Snowflake } from "@antibot/interactions";
import { Plugin } from "../Common/DefinePlugin";
import { Redis } from "ioredis";
import { Store } from "./Store";

export class Context extends Client {
    public plugin: ZillaCollection<string, Plugin>;
    public interactions: ZillaCollection<string, Command<ChatInputCommandInteraction | ContextMenuCommandInteraction>>;
    public interact: Interactions;
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
        this.store = new Store(this);
    }
}
