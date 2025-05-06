import { Tag } from '../Models/GuildSchema';

export type State = {
    addTopicPages?: {
        page: number;
        pages: string[][];
    };
    page?: number;
    tagPages?: Tag[][];
};
