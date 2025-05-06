import { model, Schema } from 'mongoose';

import { UserDocument } from './UserDocument';

export default model<UserDocument>(
    'support-helpers',
    new Schema(
        {
            _id: String,
            Incognito: {
                ShowCommandAuthor: { default: false, type: Boolean },
                ShowCommands: { default: false, type: Boolean },
            },
        },
        { timestamps: true, versionKey: false },
    ),
);
