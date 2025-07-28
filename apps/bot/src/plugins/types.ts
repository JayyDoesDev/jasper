import { Tag } from '../models/guildSchema';

export type State = {
    addActionPages?: {
        page: number;
        pages: string[][];
    };
    addObjectPages?: {
        page: number;
        pages: string[][];
    };
    addTopicPages?: {
        page: number;
        pages: string[][];
    };
    page?: number;
    tagPages?: Tag[][];
};
