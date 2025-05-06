import { Message } from 'discord.js';

import { defineEvent } from '../Common/define';
import { checkForRoles } from '../Common/roles';
import { Options } from '../Services/SettingsService';
import { Context } from '../Source/Context';

import { Listener } from './Listener';

export default class MessageDeleteListener extends Listener<'messageDelete'> {
    constructor(ctx: Context) {
        super(ctx, 'messageDelete');
    }

    public async execute(message: Message<true>): Promise<void> {
        await this.ctx.services.settings.configure<Options>({ guildId: message.guild.id });
        const { Channels, Roles, Users } = this.ctx.services.settings.getSettings();

        if (Channels.AllowedSnipeChannels?.includes(message.channel.id)) {
            if (Users.IgnoreSnipedUsers?.includes(message.author.id)) return;
            if (checkForRoles(message, ...Roles.IgnoredSnipedRoles)) return;
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
