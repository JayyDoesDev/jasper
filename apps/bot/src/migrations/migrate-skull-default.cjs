const { config } = require('dotenv');
const { DatabaseManager } = require('../database/factory');
const path = require('path');

config();

async function migrateSkullDefault() {
    const dbManager = DatabaseManager.getInstance();
    
    // Initialize database connection
    const dbType = process.env.DATABASE_TYPE || 'mongodb';
    let dbConfig;
    
    switch (dbType) {
        case 'mongodb':
            dbConfig = {
                type: 'mongodb',
                connectionString: process.env.MONGODB,
                options: { maxPoolSize: 10 }
            };
            break;
        case 'sqlite':
            const sqlitePath = process.env.DATABASE_PATH || './data/jasper.db';
            dbConfig = {
                type: 'sqlite',
                filePath: path.resolve(sqlitePath)
            };
            break;
        case 'json':
            const jsonPath = process.env.DATABASE_PATH || './data/jasper.json';
            dbConfig = {
                type: 'json',
                filePath: path.resolve(jsonPath)
            };
            break;
        default:
            throw new Error(`Unsupported database type: ${dbType}`);
    }
    
    await dbManager.initialize(dbConfig);
    const database = dbManager.getAdapter();

    const result = await database.bulkUpdate(
        {
            $or: [
                { 'Skullboard.SkullboardEmoji': { $exists: false } },
                { 'Skullboard.SkullboardEmoji': { $eq: null } },
                { 'Skullboard.SkullboardEmoji': { $size: 0 } },
            ],
        },
        {
            $set: {
                'Skullboard.SkullboardEmoji': '💀',
            },
        },
    );

    console.log(`Updated ${result.modifiedCount} guilds with default Skullboard emoji.`);
    await database.disconnect();
}

migrateSkullDefault().catch((err) => {
    console.error(err);
    process.exit(1);
});
