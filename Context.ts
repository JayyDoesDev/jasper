import { Client, Partials, IntentsBitField } from "discord.js";
import { ZillaCollection } from "@antibot/zilla";
import { Command } from "./Common/DefineCommand";
import { Interactions, Snowflake } from "@antibot/interactions";
import { Plugin } from "./Common/DefinePlugin";

export class Context extends Client {
  public plugin: ZillaCollection<string, Plugin>;
  public cooldown: ZillaCollection<string, Command>;
  public interactions: ZillaCollection<string, Command>;
  public interact: Interactions;
  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages
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
    });
    this.plugin = new ZillaCollection<string, Plugin>();
    this.cooldown = new ZillaCollection<string, Command>();
    this.interactions = new ZillaCollection<string, Command>();
    this.interact = new Interactions({
      publicKey: process.env.PUBLICKEY as unknown as string,
      botID: process.env.BOTID as unknown as Snowflake,
      botToken: process.env.TOKEN as unknown as string,
      debug: true,
    });
  }
}
