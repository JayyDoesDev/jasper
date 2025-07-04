import { Message } from 'discord.js';

import { Context } from '../classes/context';
import { defineEvent } from '../define';
import { checkForRoles } from '../roles';
import { Options } from '../services/settingsService';

import { Listener } from './listener';

export default class MessageDeleteListener extends Listener<'messageDelete'> {
    constructor(ctx: Context) {
        super(ctx, 'messageDelete');
    }

    public async execute(message: Message<true>): Promise<void> {
        if (!message.guild) return;
        /* ^
         * | Patches an interesting bug, temporary fix.
         * Error: TypeError: Cannot read properties of null (reading 'id')
         */

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
