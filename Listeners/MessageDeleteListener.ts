import { Message } from 'discord.js';
import { Context } from '../Source/Context';
import { Listener } from './Listener';
import { defineEvent } from '../Common/define';
import { Options } from '../Services/SettingsService';

export default class MessageDeleteListener extends Listener<'messageDelete'> {
    constructor(ctx: Context) {
        super(ctx, 'messageDelete');
    }

    public async execute(message: Message<true>): Promise<void> {
        await this.ctx.services.settings.configure<Options>({ guildId: message.guild.id });
        const { Channels } = this.ctx.services.settings.getSettings();

        if (Channels.AllowedSnipeChannels?.includes(message.channel.id)) {
            this.ctx.snipe.set(message.channel.id, message);
        } else {
            return;
        }
    }

    public toEvent() {
        return defineEvent({
            event: {
                name: this.name,
                once: this.once,
            },
            on: (message: Message<true>) => this.execute(message),
        });
    }
}
