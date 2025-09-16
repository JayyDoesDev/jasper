import { DatabaseAdapter, DatabaseConfig, DatabaseFactory } from './interfaces';
import { MongoDBAdapter } from './adapters/mongodbAdapter';
import { JsonAdapter } from './adapters/jsonAdapter';
import { SQLiteAdapter } from './adapters/sqliteAdapter';

export class DatabaseFactoryImpl implements DatabaseFactory {
    createAdapter(config: DatabaseConfig): DatabaseAdapter {
        switch (config.type) {
            case 'mongodb':
                return new MongoDBAdapter();
            case 'json':
                return new JsonAdapter();
            case 'sqlite':
                return new SQLiteAdapter();
            default:
                throw new Error(`Unsupported database type: ${config.type}`);
        }
    }
}

/**
 * Database Manager - singleton to manage database connection
 */
export class DatabaseManager {
    private static instance: DatabaseManager;
    private adapter: DatabaseAdapter | null = null;
    private factory: DatabaseFactory;

    private constructor() {
        this.factory = new DatabaseFactoryImpl();
    }

    static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    async initialize(config: DatabaseConfig): Promise<void> {
        if (this.adapter) {
            await this.adapter.disconnect();
        }

        this.adapter = this.factory.createAdapter(config);
        await this.adapter.connect(config);
    }

    getAdapter(): DatabaseAdapter {
        if (!this.adapter) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.adapter;
    }

    async disconnect(): Promise<void> {
        if (this.adapter) {
            await this.adapter.disconnect();
            this.adapter = null;
        }
    }

    isConnected(): boolean {
        return this.adapter ? this.adapter.isConnected() : false;
    }
}