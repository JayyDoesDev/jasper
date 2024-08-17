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
SUPPORT_THREAD
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
