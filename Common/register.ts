import * as Path from 'path';
import { sync } from 'glob';
import { Command, Event } from './define';
import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

function massRegister<
    T extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
    U extends { Command?: Command<T>; Event?: Event<T> },
>(
    dir: string,
    paths: string[],
    property: keyof U,
): U extends { Command: Command<T> } ? Command<T>[] : Event<T>[] {
    const items: (Command<T> | Event<T>)[] = [];

    for (const path of paths) {
        const matchingPaths = sync(Path.join(Path.join(dir, path), '**/**/*.js'));

        for (const folder of matchingPaths) {
            const module = require(Path.resolve(folder));
            if (module[property]) {
                items.push(module[property]);
            }
        }
    }

    return <U extends { Command: Command<T> } ? Command<T>[] : Event<T>[]>items;
}

export function massRegisterCommands<
    T extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
>(dir: string, paths: string[]): Command<T>[] {
    return massRegister<T, { Command: Command<T> }>(dir, paths, 'Command');
}

export function massRegisterEvents<
    T extends ChatInputCommandInteraction | ContextMenuCommandInteraction,
>(dir: string, paths: string[]): Event<T>[] {
    return massRegister<T, { Event: Event<T> }>(dir, paths, 'Event');
}
