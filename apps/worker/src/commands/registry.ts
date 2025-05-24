import { Command } from '../types';

import fun from './fun';
import generic from './generic';

export const commands: Command[] = [
    ...fun.commands,
    ...generic.commands
];
