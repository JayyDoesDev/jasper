<p align="center"><img src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true" alt="jasper" width="500""></p>
<h1 align="center">Jasper Worker</h1>
<h2 align="center">☁️ Cloudflare Jasper worker instance </h2>

## Project Structure

```
.worker/
├── src/
│   ├── commands/           # Command definitions and registry
│   │   ├── definitions.ts  # Individual command definitions
│   │   └── registry.ts     # Command registration and type exports
│   ├── handlers/           # Command execution handlers
│   │   └── commands.ts     # Command handling logic
│   ├── scripts/            # CLI scripts
│   │   └── register-commands.ts  # Command registration script
│   ├── server/             # Server implementation
│   │   └── index.ts       # Main server setup and routing
│   ├── types/             # TypeScript type definitions
│   │   ├── Command.ts     # Command interface definitions
│   │   ├── server.ts      # Server-related type definitions
│   │   └── index.ts       # Type re-exports
│   ├── utils/             # Utility functions
│   │   ├── register.ts    # Command registration utilities
│   │   └── responses.ts   # Response creation utilities
│   └── index.ts           # Main entry point
├── .env                   # Environment variables
└── wrangler.jsonc         # Cloudflare Worker configuration
```

## Key Components

1. **Commands**: Defined in `src/commands/definitions.ts`, each command specifies its name, description, and permissions.

2. **Command Handlers**: Located in `src/handlers/commands.ts`, these functions process incoming command interactions.

3. **Server**: The main server setup in `src/server/index.ts` handles routing and request verification.

4. **Types**: TypeScript interfaces and types are organized in the `src/types/` directory.

5. **Utilities**: Helper functions for common tasks like creating responses and registering commands.

## Environment Variables

- `BOT_TOKEN`: Discord bot token
- `BOT_ID`: Discord application ID
- `PUBLIC_KEY`: Discord public key for request verification

## Development

1. Copy `.env.example` to `.env` and fill in the required values
2. Install dependencies: `yarn`
3. Build TypeScript files: `yarn build`
4. Register commands: `yarn register`
5. Start development server: `yarn dev`
6. Deploy: `yarn deploy`

## Scripts

- `yarn build` - Compiles TypeScript files
- `yarn register` - Registers Discord slash commands
- `yarn dev` - Starts the development server
- `yarn deploy` - Deploys to Cloudflare Workers
- `yarn typecheck` - Runs TypeScript type checking

## Type Safety

The project is written in TypeScript and includes proper type definitions for:
- Discord API interactions
- Command structures
- Server configuration
- Environment variables

This ensures type safety and enables better IDE support during development.
