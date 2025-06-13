# JasperExternalDependencies

This project provides the external dependencies infrastructure for the Jasper Bot ecosystem using Docker containers. It sets up MongoDB and Redis services in an isolated Docker network with fixed IP addresses.

## 📋 Overview

The JasperExternalDependencies project contains:
- **MongoDB**: Database service for persistent data storage
- **Redis**: In-memory cache and session storage
- **Docker Network**: Isolated network configuration for service communication

## 🚀 Quick Start

### Prerequisites
- Docker Engine
- Docker Compose

### Setup and Installation

1. **Configure Environment Variables**
   
   Copy the example environment files and customize them for your setup:
   ```bash
   # Copy example files to active configuration
   cp env/example.mongo.env env/mongo.env
   cp env/example.redis.env env/redis.env
   ```
   
   **⚠️ Important**: Edit the environment files to match your security requirements:
   
   **For MongoDB (`env/mongo.env`)**:
   ```env
   MONGO_INITDB_ROOT_USERNAME=jasper          # Change this username
   MONGO_INITDB_ROOT_PASSWORD=jasper123       # Change this password
   MONGO_INITDB_DATABASE=jasperdb             # Change database name if needed
   ```
   
   **For Redis (`env/redis.env`)**:
   ```env
   REDIS_PASSWORD=jasper123                   # Change this password
   REDIS_PORT=6379                           # Keep as 6379 unless you have conflicts
   ```

2. **Create the Docker Network**
   ```bash
   chmod +x docker_network.sh
   ./docker_network.sh
   ```

3. **Start the Services**
   ```bash
   docker-compose up -d
   ```

4. **Verify Services are Running**
   ```bash
   docker-compose ps
   ```

## 🔧 Configuration

### Environment Variables

The project uses environment files to configure the services. You **must** customize these before deployment:

#### Current Configuration (matches your bot's `.env` file):

```env
# MongoDB Configuration
MONGODB=mongodb://jasper:jasper123@172.30.1.3:27017/jasperdb?authSource=admin

# Redis Configuration  
REDISHOST=172.30.1.2
REDISPORT=6379
```

#### Customizing Environment Files

**⚠️ Security Warning**: The example files contain default credentials that should be changed for any real deployment.

**MongoDB Environment (`env/mongo.env`)**:
```env
MONGO_INITDB_ROOT_USERNAME=jasper          # ← Change this username
MONGO_INITDB_ROOT_PASSWORD=jasper123       # ← Change this password  
MONGO_INITDB_DATABASE=jasperdb             # ← Change database name if needed
```

**Redis Environment (`env/redis.env`)**:
```env
REDIS_PASSWORD=jasper123                   # ← Change this password
REDIS_PORT=6379                           # ← Keep as 6379 unless you have conflicts
```

#### Updating Your Bot's Configuration

After changing the credentials, update your bot's `.env` file accordingly:

```env
# If you changed MongoDB credentials, update the connection string:
MONGODB=mongodb://YOUR_USERNAME:YOUR_PASSWORD@172.30.1.3:27017/YOUR_DATABASE?authSource=admin

# Redis configuration (update if you changed the password):
REDISHOST=172.30.1.2
REDISPORT=6379
```

### Network Configuration

- **Network Name**: `jasper_network`
- **Subnet**: `172.30.1.0/24`
- **MongoDB IP**: `172.30.1.3`
- **Redis IP**: `172.30.1.2`

## 📁 Project Structure

```
JasperExternalDependencies/
├── docker-compose.yml          # Main Docker Compose configuration
├── docker_network.sh          # Network creation script
├── README.md                   # This documentation
├── env/                        # Environment files
│   ├── mongo.env              # MongoDB environment variables
│   ├── redis.env              # Redis environment variables
│   ├── example.mongo.env      # MongoDB example configuration
│   └── example.redis.env      # Redis example configuration
└── volumes/                    # Persistent data storage
    ├── mongodb_data/          # MongoDB data directory
    └── redis_data/            # Redis data directory
```

## 🗄️ Service Details

### MongoDB Service

- **Container Name**: `jasper_mongo`
- **Image**: `mongo:8-noble`
- **Internal IP**: `172.30.1.3`
- **Port**: `27017` (internal only)
- **Database**: `jasperdb` (or your custom database name)
- **Username**: `jasper` (or your custom username)
- **Password**: `jasper123` (or your custom password)

**Connection String**: `mongodb://[username]:[password]@172.30.1.3:27017/[database]?authSource=admin`

### Redis Service

- **Container Name**: `jasper_redis`
- **Image**: `redis:latest`
- **Internal IP**: `172.30.1.2`
- **Port**: `6379` (internal only)
- **Password**: `jasper123` (or your custom password)

## 🛠️ Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f jasper_mongo
docker-compose logs -f jasper_redis
```

### Restart Services
```bash
docker-compose restart
```

### Check Service Status
```bash
docker-compose ps
```

## 🔍 Troubleshooting

### Network Issues
If you encounter network connection issues:

1. **Verify the network exists**:
   ```bash
   docker network ls | grep jasper_network
   ```

2. **Recreate the network if needed**:
   ```bash
   docker network rm jasper_network
   ./docker_network.sh
   ```

### Service Connection Issues

1. **Check if services are running**:
   ```bash
   docker-compose ps
   ```

2. **Test MongoDB connection** (adjust credentials if you changed them):
   ```bash
   docker exec -it jasper_mongo mongosh mongodb://jasper:jasper123@localhost:27017/jasperdb?authSource=admin
   ```

3. **Test Redis connection** (adjust password if you changed it):
   ```bash
   docker exec -it jasper_redis redis-cli -a jasper123
   ```

### Data Persistence

- MongoDB data is persisted in `./volumes/mongodb_data/`
- Redis data is persisted in `./volumes/redis_data/`
- These directories are automatically created when containers start

## 🔒 Security Notes

- Services are only accessible within the Docker network
- Ports are not exposed to the host system for security
- **⚠️ Default credentials are provided in example files - CHANGE THEM for any real deployment**
- Consider using Docker secrets or external secret management for production environments
- The example passwords (`jasper123`) should never be used in production

## 🔄 Integration with Jasper Bot

This infrastructure is designed to work seamlessly with the Jasper Bot application. After customizing your environment files, update the bot's `.env` file with the corresponding values:

```env
# Update these values to match your env/mongo.env and env/redis.env files
MONGODB=mongodb://[YOUR_USERNAME]:[YOUR_PASSWORD]@172.30.1.3:27017/[YOUR_DATABASE]?authSource=admin
REDISHOST=172.30.1.2
REDISPORT=6379
```

**Example with default values** (change these for production):
```env
MONGODB=mongodb://jasper:jasper123@172.30.1.3:27017/jasperdb?authSource=admin
REDISHOST=172.30.1.2
REDISPORT=6379
```

## 📝 Notes

- The `docker-compose.yml` has commented port mappings for security
- Uncomment port mappings if you need external access during development
- The network uses a custom subnet to avoid conflicts with other Docker networks
