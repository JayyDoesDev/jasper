<p align="center"><img src="https://github.com/JayyDoesDev/jasper/blob/main/.github/assets/jasper.png?raw=true" alt="jasper" width="500""></p>
<h1 align="center">Jasper Webserver</h1>
<h2 align="center">🌐 Spring Boot server for Jasper's web functionality</h2>

## Project Structure

```
.webserver/
├── src/main/
│   ├── kotlin/tara/tb1/pw/
│   │   ├── Playwright/           # Playwright integration
│   │   │   ├── Playwright.kt     # Playwright core functionality
│   │   │   └── PlaywrightController.kt # REST endpoints
│   │   └── JasperWebserverApplication.kt # Main application
│   └── resources/
│       ├── templates/            # HTML templates
│       │   └── skullboard.html   # Skullboard message template
│       └── application.properties # Application configuration
├── build.gradle.kts             # Gradle build configuration
└── settings.gradle.kts          # Gradle settings
```

## Key Components

1. **Playwright Integration**: Handles browser automation for generating images from HTML templates.
   - `Playwright.kt`: Core functionality for browser control and image generation
   - `PlaywrightController.kt`: REST endpoints for image generation services

2. **HTML Templates**: Located in `src/main/resources/templates/`, these files define the visual structure of generated content.
   - `skullboard.html`: Template for Discord message screenshots

3. **Application Configuration**: Spring Boot configuration in `application.properties`

## Development

1. Install dependencies:
   ```bash
   ./gradlew build
   ```

2. Run the server:
   ```bash
   ./gradlew bootRun
   ```

## API Endpoints

### Playwright Controller

- `GET /playwright/test`
  - Tests if the Playwright service is working
  - Returns: String confirmation message

- `POST /playwright/execute`
  - Executes a Playwright script
  - Body: Script content
  - Returns: Execution result

- `POST /playwright/render`
  - Renders HTML content to an image
  - Body: RenderData object
  - Returns: PNG image

## Environment Setup

The application requires:
1. Java 17 or higher
2. Gradle
3. Playwright dependencies

## Scripts

- `./gradlew build` - Builds the project
- `./gradlew test` - Runs tests
- `./gradlew bootRun` - Starts the development server
- `./gradlew bootJar` - Creates an executable JAR

## Type Safety

The project is written in Kotlin and leverages:
- Strong type system
- Null safety features
- Spring Boot type-safe configuration
- Kotlin data classes for request/response models
