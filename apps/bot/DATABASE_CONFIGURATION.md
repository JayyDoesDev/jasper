# Database Configuration Guide

Jasper now supports multiple database backends to suit different deployment needs. You can choose between MongoDB, SQLite, or JSON file storage.

## Supported Database Types

### MongoDB (Default)
- Best for production deployments with high availability requirements
- Requires external MongoDB server or service
- Supports complex queries and transactions

### SQLite
- Best for development and small-scale deployments
- Self-contained database in a single file
- No external dependencies
- Good performance for moderate loads

### JSON File
- Best for development and testing
- Human-readable storage format
- Easy to backup and migrate
- Limited query capabilities

## Configuration

Set the following environment variables in your `.env` file:

### Database Type Selection
```env
DATABASE_TYPE=mongodb  # Options: mongodb, sqlite, json
```

### MongoDB Configuration
```env
DATABASE_TYPE=mongodb
MONGODB=mongodb://username:password@localhost:27017/jasperdb
```

### SQLite Configuration
```env
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/jasper.db
```

### JSON Configuration
```env
DATABASE_TYPE=json
DATABASE_PATH=./data/jasper.json
```

## Migration

The migration scripts have been updated to work with all database backends. Run migrations using:

```bash
# Topics migration
npm run migration:topics

# Skull emoji migration  
npm run migration:skull_default
```

## Development vs Production

### Development
For local development, SQLite or JSON are recommended:
```env
DATABASE_TYPE=sqlite
DATABASE_PATH=./dev-data/jasper.db
```

### Production
For production deployments, MongoDB is recommended:
```env
DATABASE_TYPE=mongodb
MONGODB=mongodb://user:pass@your-mongo-host:27017/jasperdb
```

## Data Directory

When using SQLite or JSON, ensure the data directory exists and is writable:
```bash
mkdir -p ./data
chmod 755 ./data
```

## Backup and Recovery

### MongoDB
Use MongoDB's built-in backup tools (`mongodump`, `mongorestore`)

### SQLite
Copy the database file:
```bash
cp ./data/jasper.db ./backup/jasper-backup.db
```

### JSON
Copy the JSON file:
```bash
cp ./data/jasper.json ./backup/jasper-backup.json
```

## Performance Considerations

- **MongoDB**: Best for multiple concurrent users, complex queries
- **SQLite**: Good for single-server deployments, moderate load
- **JSON**: Best for development only, not recommended for production

## Troubleshooting

### Database Connection Issues
1. Check your `DATABASE_TYPE` setting
2. Verify connection string or file path
3. Ensure database server is running (MongoDB)
4. Check file permissions (SQLite/JSON)

### Migration Issues
1. Ensure the database is accessible
2. Check that the `DATABASE_TYPE` matches your setup
3. Run migrations with proper environment variables set

### Converting Between Database Types
Currently, automatic conversion between database types is not supported. To migrate:
1. Export data using appropriate tools
2. Update configuration
3. Import data to new database
4. Run migrations as needed