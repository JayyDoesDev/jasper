import { Tag } from '../Models/GuildSchema';

export type State = {
    page?: number;
    tagPages?: Tag[][];
    addTopicPages?: {
        pages: string[][];
        page: number;
    };
};
