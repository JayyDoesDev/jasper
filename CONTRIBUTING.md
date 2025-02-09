# Contributing to Jasper

First off, thank you for considering contributing to Jasper! It’s people like you that make Jasper such a great tool.

## How to Contribute

### Reporting Bugs

If you encounter any bugs, please open an issue on GitHub with detailed information about the bug and how to reproduce it. Include any
relevant logs and screenshots to help us diagnose the problem.

### Suggesting Enhancements

If you have an idea to enhance Jasper, feel free to open an issue on GitHub with detailed information about the enhancement. Describe the
problem you’re trying to solve and how your enhancement will help.

### Submitting Pull Requests

1. **Fork the Repository**: Click the "Fork" button at the top-right corner of the repository page.

2. **Clone the Repository**:

    ```sh
    git clone https://github.com/your-username/jasper.git
    cd jasper
    ```

3. **Install Dependencies**:

    ```sh
    yarn install
    ```

4. **Create a Branch**: Create a new branch for your feature or bugfix.

    ```sh
    git checkout -b feature/your-feature-name
    ```

5. **Make Changes**: Implement your changes. Make sure your code follows the existing code style and conventions.

6. **Commit Changes**: Commit your changes with a meaningful commit message.

    ```sh
    git add .
    git commit -m "Add a meaningful commit message"
    ```

7. **Push Changes**: Push your changes to your fork.

    ```sh
    git push origin feature/your-feature-name
    ```

8. **Open a Pull Request**: Go to the original repository and open a pull request. Provide a detailed description of your changes and link
   any relevant issues.

## Development Setup

### Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```dotenv
BOTID=
PUBLICKEY=
TOKEN=
MONGODB=
PREFIX=
SUPPORT_ROLE=
ADMIN_ROLE=
STAFF_ROLE=
GUILD_ONLY_COMMANDS=1 # 1 = true 0 = false
GUILD_ONLY_COMMANDS_GUILD_ID=
YOUTUBE_CHANNEL_ID=
YOUTUBE_KEY=
YOUTUBE_KEY_TWO=
YOUTUBE_KEY_THREE=
YOUTUBE_VIDEO_POST_CHANNEL_ID=
YOUTUBE_VIDEO_POST_TIMER=
YOUTUBE_VIDEO_POST_UPDATE=1 # 1 = true 0 = false
SUB_COUNT_CHANNEL=
SUB_COUNT_TIMER=
SUB_COUNT_UPDATE=0 # 1 = true 0 = false
REDISHOST=
REDISPORT=
SUPPORT_THREAD=
SLOWMODE=1 # 1 = true 0 = false
SLOWMODE_CHANNEL_ID=
SLOWMODE_COOLDOWN=
SLOWMODE_MESSAGE_TIME=
SLOWMODE_MESSAGE_THRESHOLD=
SLOWMODE_RESET_SLOWMODE=
SLOWMODE_RESET_TIME=
```

### Scripts

- **Build**: Compile the TypeScript code.

    ```sh
    yarn build
    ```

- **Start**: Start the bot.

    ```sh
    yarn start
    ```

- **Development**: Run build, lint, and start the bot.

    ```sh
    yarn dev
    ```

- **Lint**: Run ESLint to check for linting errors.

    ```sh
    yarn eslint
    ```

- **Docker Build**: Build the Docker image.

    ```sh
    yarn builddocker
    ```

- **Docker Run**: Run the Docker container.

    ```sh
    yarn docker
    ```

- **Docker Stop**: Stop the Docker container.

    ```sh
    yarn dockerstop
    ```

- **Docker Compose Up**: Start services using Docker Compose.

    ```sh
    yarn docker-compose
    ```

- **Docker Compose Down**: Stop services using Docker Compose.
    ```sh
    yarn docker-compose-stop
    ```

### Code Style

We use ESLint to maintain code quality. Make sure your code passes all linting rules before submitting a pull request.

## Developer Guide

This section provides detailed information about developing new components for Jasper.

### Project Structure

The project follows a modular plugin-based architecture:

```
Jasper/
├── Common/           # Shared utilities and types
├── Handlers/         # Core command and event handlers
├── Models/           # Database schemas
├── Plugins/         # Plugin modules
│   ├── Core/       # Core bot functionality
│   │   ├── Commands/
│   │   ├── Events/
│   │   └── CorePlugin.ts
│   └── Tags/       # Tag management module
│       ├── Commands/
│       ├── SubCommands/
│       ├── Modals/
│       └── TagsPlugin.ts
└── Services/        # Service layer for database operations
```

### Creating a New Plugin

Each plugin should have its own directory under `Plugins/` with the following structure:

```typescript
// MyPlugin/MyPlugin.ts
import { Plugin } from '../../Common/define';

export const MyPlugin: Plugin = {
    name: 'MyPlugin',
    description: 'Plugin description',
    commands: [], // Commands list
    events: [], // Optional events list
    public_plugin: true, // Visibility flag
};
```

### Creating Commands

Commands are created using the `defineCommand` helper:

```typescript
// MyPlugin/Commands/MyCommand.ts
import { Command, defineCommand } from '../../../Common/define';
import { ApplicationCommandType } from '@antibot/interactions';

export const MyCommand = defineCommand({
    command: {
        type: ApplicationCommandType.CHAT_INPUT,
        name: 'mycommand',
        description: 'Command description',
    },
    permissions: [], // Optional Discord permissions
    useConfigRoles: [], // Optional configuration roles
    on: async (ctx, interaction) => {
        // Command logic
    },
});
```

#### Adding SubCommands

Subcommands provide additional functionality under a main command:

```typescript
// MyPlugin/SubCommands/MySubCommand.ts
import { defineSubCommand } from '../../../Common/define';

export const MySubCommand = defineSubCommand({
    name: 'mysubcommand',
    useConfigRoles: [], // Optional configuration roles
    handler: async (ctx, interaction) => {
        // Subcommand logic
    },
    autocomplete: async (ctx, interaction) => {
        // Optional autocomplete handler
    },
});

// Command options for registration
export const commandOptions = {
    name: MySubCommand.name,
    description: 'Subcommand description',
    type: ApplicationCommandOptionType.SUB_COMMAND,
    options: [], // Command options/arguments
};
```

### Creating Events

Events handle Discord or custom events:

```typescript
// MyPlugin/Events/MyEvent.ts
import { defineEvent } from '../../../Common/define';

export const MyEvent = defineEvent({
    event: {
        name: 'eventName', // Discord event name
        once: false, // Whether to run once or listen continuously
    },
    on: async (event, ctx) => {
        // Event handling logic
    },
});
```

### Modal Dialogs

For commands requiring user input forms:

```typescript
// MyPlugin/Modals/MyModal.ts
import { Modal } from '../../../Common/define';

export const MyModal: Modal = {
    customId: 'my_modal',
    title: 'Modal Title',
    fields: [
        {
            customId: 'field_id',
            label: 'Field Label',
            style: TextInputStyle.Short,
            required: true,
        },
    ],
};
```

### Role Configuration

When creating commands that require role-based access:

```typescript
import { ConfigurationRoles } from '../../../Common/define';

export const MyCommand = defineCommand({
    // ... other command options
    useConfigRoles: [ConfigurationRoles.AdminRoles, ConfigurationRoles.StaffRoles],
});
```

### Best Practices

1. **File Organization**

    - Keep related functionality together in plugin directories
    - Use clear, descriptive filenames
    - Export command options separately for registration

2. **Command Structure**

    - Group related commands under a single base command using subcommands
    - Use autocomplete where possible for better UX
    - Implement proper permission checks

3. **Error Handling**

    - Use try/catch blocks for async operations
    - Provide clear error messages to users
    - Handle Discord API errors appropriately

4. **Type Safety**

    - Use TypeScript interfaces and types
    - Leverage the provided type definitions
    - Define clear input/output types for functions

5. **Service Layer**

    - Use services for database operations
    - Follow the service pattern for new functionality
    - Maintain separation of concerns

6. **Testing**
    - Test commands with various permission levels
    - Verify error handling paths
    - Test integration with other plugins/services
