import { Document } from 'mongoose';

export interface UserDocument extends Document {
    _id: string;
    Incognito: { ShowCommandAuthor: boolean; ShowCommands: boolean; };
}
