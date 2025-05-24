<p align="center"><img src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true" alt="jasper" width="500""></p>
<h1 align="center">Jasper Bot</h1>
<h2 align="center">🤖 Discord bot instance for Jasper</h2>

## Project Structure

```
.bot/
├── src/
│   ├── classes/              # Core classes
│   │   ├── context.ts        # Command context handling
│   │   ├── env.ts           # Environment configuration
│   │   ├── playwright.ts    # Playwright integration
│   │   └── store.ts         # Data storage utilities
│   ├── handlers/            # Event handlers
│   │   ├── command.ts       # Command handling
│   │   ├── event.ts         # Event processing
│   │   └── listener.ts      # Event listeners
│   ├── listeners/           # Discord event listeners
│   │   ├── errorListener.ts           # Error handling
│   │   ├── interactionCreateListener.ts # Interaction handling
│   │   ├── messageCreateListener.ts    # Message handling
│   │   ├── messageDeleteListener.ts    # Message deletion
│   │   └── readyListener.ts           # Bot ready event
│   ├── models/              # Database models
│   │   ├── guildSchema.ts   # Guild configuration
│   │   └── userSchema.ts    # User data
│   ├── plugins/             # Bot functionality modules
│   │   ├── configuration/   # Server configuration
│   │   ├── core/           # Core bot features
│   │   ├── moderator/      # Moderation tools
│   │   └── tags/           # Tag system
│   ├── services/           # Business logic
│   │   ├── settingsService.ts # Settings management
│   │   └── tagService.ts    # Tag operations
│   └── index.ts            # Main entry point
├── .env                    # Environment variables
└── package.json           # Project configuration
```

## Key Components

1. **Plugins**: Modular functionality organized by feature
   - Configuration: Server-specific settings and setup
   - Core: Essential bot commands and features
   - Moderator: Moderation and administration tools
   - Tags: Custom command and response system

2. **Event System**: Robust event handling infrastructure
   - Command processing
   - Message management
   - Interaction responses
   - Error handling

3. **Database Models**: MongoDB schemas for data storage
   - Guild configurations
   - User data
   - Tag storage

4. **Services**: Business logic abstraction
   - Settings management
   - Tag operations
   - Core functionality

## Environment Variables

Required environment variables:
- `BOTID`: Discord application ID
- `PUBLICKEY`: Discord public key
- `TOKEN`: Discord bot token
- `MONGODB`: MongoDB connection string
- `GUILD_ONLY_COMMANDS`: Enable guild-only commands (1 = true, 0 = false)
- `GUILD_ONLY_COMMANDS_GUILD_ID`: Guild ID for guild-only commands

YouTube integration:
- `YOUTUBE_CHANNEL_ID`: YouTube channel ID to monitor
- `YOUTUBE_KEY`: YouTube API key
- `YOUTUBE_KEY_TWO`: Backup YouTube API key
- `YOUTUBE_KEY_THREE`: Additional backup YouTube API key
- `YOUTUBE_VIDEO_POST_CHANNEL_ID`: Channel ID for video notifications
- `YOUTUBE_VIDEO_POST_TIMER`: Notification check interval
- `YOUTUBE_VIDEO_DISCUSSIONS_ROLE_ID`: Role ID for video discussion notifications
- `YOUTUBE_VIDEO_POST_UPDATE`: Enable video post updates
- `SUB_COUNT_CHANNEL`: Channel ID for subscriber count updates
- `SUB_COUNT_TIMER`: Subscriber count check interval
- `SUB_COUNT_UPDATE`: Enable subscriber count updates (1 = true, 0 = false)

Redis configuration:
- `REDISHOST`: Redis server host
- `REDISPORT`: Redis server port

Slowmode settings:
- `SLOWMODE`: Enable slowmode (1 = true, 0 = false)
- `SLOWMODE_CHANNEL_ID`: Channel ID for slowmode
- `SLOWMODE_COOLDOWN`: Slowmode cooldown duration
- `SLOWMODE_MESSAGE_TIME`: Message time window
- `SLOWMODE_MESSAGE_THRESHOLD`: Message threshold for slowmode
- `SLOWMODE_RESET_SLOWMODE`: Reset slowmode interval
- `SLOWMODE_RESET_TIME`: Time to reset slowmode

## Development

1. Copy `.env.example` to `.env` and fill in the values
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Build the project:
   ```bash
   yarn build
   ```
4. Start development server:
   ```bash
   yarn dev
   ```

## Scripts

### Development
- `yarn build` - Compiles JavaScript and TypeScript files
- `yarn dev` - Builds project, runs ESLint, and starts the bot
- `yarn start` - Runs the production build
- `yarn eslint` - Lints and fixes TypeScript and JavaScript files
- `yarn pretty` - Formats code using Prettier

### Docker
- `yarn builddocker` - Builds Docker image
- `yarn docker` - Runs Docker container
- `yarn dockerstop` - Stops Docker container
- `yarn docker-compose` - Starts services using Docker Compose
- `yarn docker-compose-stop` - Stops Docker Compose services

### Database Migrations
- `yarn migration` - Runs base migration setup
- `yarn migration:topics` - Migrates topics data
- `yarn migration:skull_default` - Migrates skull default settings
- `yarn migration:ensure_skull_emoji` - Ensures skull emoji configuration

## Type Safety

The project is written in TypeScript and includes comprehensive type definitions for:
- Anti-Bot interactions w/ Discord.js
- Command structures
- Event handlers
- Database models
- Configuration objects

This ensures type safety throughout the application and provides excellent IDE support during development.
