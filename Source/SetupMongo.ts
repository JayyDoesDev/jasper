import mongoose, { ConnectOptions } from 'mongoose';

export type Mongo = {
    config?: ConnectOptions;
    uri: string;
};

export function SetupMongo(options: Mongo): void {
    mongoose.connect(options.uri, options.config);

    mongoose.connection.on('connected', () => {
        console.log('Database connected');
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Database disconnected');
    });
}
