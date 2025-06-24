import { Tag } from '../models/guildSchema';

export type State = {
    addTopicPages?: {
        page: number;
        pages: string[][];
    };
    page?: number;
    tagPages?: Tag[][];
};
