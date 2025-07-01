# WebserverGo

A high-performance Go-based webserver that serves as a remake of the original Java SpringBoot webserver. This server provides various APIs for YouTube channel information and fun image generation features.

## Features

- 🎥 **YouTube API Integration** - Channel information and subscriber count retrieval
- 🎨 **Image Generation** - Meme and skullboard image generators
- 🔐 **API Authentication** - Secure API key-based authentication middlewar
- 🐳 **Docker Support** - Containerized deployment ready

## Prerequisites

- Go 1.24.4 or higher
- Docker (optional, for containerized deployment)
- YouTube Data API keys (for YouTube Subscriber Counter functionality in the bot)

## Quick Start

### Local Development

1. **Clone and navigate to the directory**
   ```bash
   cd apps/webserverGo
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure the required variables (see [Environment Variables](#environment-variables) section).

3. **Build and run**
   ```bash
   make build
   make run
   ```

The server will start on `http://localhost:8080`

### Using Docker

1. **Using Docker Compose (recommended)**
   ```bash
   docker compose up
   ```

2. **Using Docker directly**
   ```bash
   docker build -t jasper-webserver-go .
   docker run -p 8080:8080 --env-file .env jasper-webserver-go
   ```

## Environment Variables

Configure these variables in your `.env` file:

| Variable | Description | Required |
|----------|-------------|----------|
| `JASPER_API_KEY` | API key for authenticating requests to the server | ✅ Yes |
| `YOUTUBE_API_KEY_1` | Primary YouTube Data API key | ✅ Yes (for subcriber count funcionality) |
| `YOUTUBE_API_KEY_2` | Secondary YouTube Data API key (optional backup) | ❌ No |
| `YOUTUBE_API_KEY_3` | Tertiary YouTube Data API key (optional backup) | ❌ No |

**Note**: You need at least one YouTube API key for YouTube-related endpoints to work. Multiple keys provide redundancy and help avoid rate limiting.

## API Endpoints

### Authentication

All endpoints require the `JASPER_API_KEY` to be provided via the authentication middleware.

### YouTube Endpoints

#### Get Channel Information
```
GET /youtube/{channelId}
```
Retrieves detailed information about a YouTube channel.

**Parameters:**
- `channelId` (path) - The YouTube channel ID

**Response:** Channel information including name, description, statistics, etc.

#### Get Channel Subscriber Count
```
GET /youtube/{channelId}/subscribers
```
Retrieves the current subscriber count for a YouTube channel.

**Parameters:**
- `channelId` (path) - The YouTube channel ID

**Response:** Current subscriber count

### Fun Endpoints

#### Generate Meme
```
POST /fun/meme
```
Generates a custom meme image.

**Request Body:** JSON with meme parameters
**Response:** Generated meme image

#### Generate Skullboard
```
POST /fun/skullboard
```
Generates a skullboard image.

**Request Body:** JSON with skullboard parameters
**Response:** Generated skullboard image

## Available Commands

The project includes a Makefile with the following commands:

```bash
make build    # Build the application binary
make run      # Run the built application
make clean    # Remove built binaries
```

## Project Structure

```
webserverGo/
├── main.go              # Application entry point
├── go.mod               # Go module definition
├── go.sum               # Go module checksums
├── Makefile             # Build automation
├── Dockerfile           # Docker container configuration
├── docker-compose.yml   # Docker Compose configuration
├── .env.example         # Environment variables template
├── bin/                 # Built binaries (generated)
├── middleware/          # HTTP middleware (authentication, etc.)
├── routes/              # HTTP route handlers
│   ├── fun/            # Fun/entertainment endpoints
│   └── youtube/        # YouTube API endpoints
├── utils/              # Utility functions
└── generators/         # Image generation utilities
```

## Dependencies

- **[Gorilla Mux](https://github.com/gorilla/mux)** - HTTP router and URL matcher
- **[godotenv](https://github.com/joho/godotenv)** - Environment variable loading
- **[gg](https://github.com/fogleman/gg)** - 2D graphics library for image generation
- **golang.org/x/image** - Extended image processing

## Development

### Adding New Endpoints

1. Create a new handler function in the appropriate route directory
2. Register the route in `main.go`
3. Update this documentation

### Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...
```

## Troubleshooting

### Common Issues

1. **"No .env file found"** - Make sure you've copied `.env.example` to `.env`
2. **YouTube API errors** - Verify your YouTube API keys are valid and have sufficient quota
3. **Port already in use** - Change the port in `main.go` or stop the conflicting service

### Logs

The application logs important events to stdout. Use Docker logs to view them:
```bash
docker compose logs -f webserverGo
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [main LICENSE](../../LICENSE) file for details.
