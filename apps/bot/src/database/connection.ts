import { Context } from '../classes/context';
import { DatabaseConfig, DatabaseManager } from './';
import path from 'path';

/**
 * Initialize database connection based on environment configuration
 */
export async function initializeDatabase(ctx: Context): Promise<void> {
    const dbManager = DatabaseManager.getInstance();
    
    const dbType = ctx.env.get('db_type') || ctx.env.get('database_type') || 'mongodb';
    
    let config: DatabaseConfig;
    
    switch (dbType) {
        case 'mongodb':
            config = {
                type: 'mongodb',
                connectionString: ctx.env.get('db') || ctx.env.get('MONGODB'),
                options: { maxPoolSize: 10 }
            };
            break;
            
        case 'sqlite':
            const sqlitePath = ctx.env.get('db_path') || ctx.env.get('database_path') || './data/jasper.db';
            config = {
                type: 'sqlite',
                filePath: path.resolve(sqlitePath)
            };
            break;
            
        case 'json':
            const jsonPath = ctx.env.get('db_path') || ctx.env.get('database_path') || './data/jasper.json';
            config = {
                type: 'json',
                filePath: path.resolve(jsonPath)
            };
            break;
            
        default:
            throw new Error(`Unsupported database type: ${dbType}`);
    }
    
    await dbManager.initialize(config);
}

/**
 * Get the current database adapter
 */
export function getDatabase() {
    return DatabaseManager.getInstance().getAdapter();
}