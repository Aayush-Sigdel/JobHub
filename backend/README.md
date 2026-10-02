# Backend

This README explains how to start the Java backend (Spring Boot) for this project.

## Prerequisites

- JDK 17
- PostgreSQL with the `pgvector` extension enabled
- Redis
- Docker (required for programming-task judging)
- The embedding API from `../machine_learning` (used for profile/job embeddings)
- Git (to clone repo)

## Default Address

The backend listens on `SERVER_PORT` (default `8080`). Use `SPRING_APPLICATION_JSON` or `SERVER_PORT` to change it.

## Environment Variables

Create a `.env` file in this folder (names match `application.properties`):

```env
DATABASE_URL=jdbc:postgresql://<host>:<port>/<db>
DATABASE_USERNAME=<db-user>
DATABASE_PASSWORD=<db-pass>
REDIS_HOST=localhost
REDIS_PORT=6379
MAIL_ADDRESS=<smtp-user>
MAIL_PASSWORD=<smtp-pass>
JWT_SECRET=<jwt-secret>
EMBEDDING_API_URL=http://localhost:8001
GITHUB_TOKEN=<optional>
STACKOVERFLOW_KEY=<optional>
```

Mail is sent through `smtp.gmail.com:587`. When running in Docker, set `REDIS_HOST=redis` and point `EMBEDDING_API_URL` at an address reachable from the container.

## Sandbox Images

Programming-task submissions are judged inside isolated Docker containers, built from images defined in `application.properties`:

```properties
sandbox.image-java=coderunner-java
sandbox.images[0].image-name=${sandbox.image-java}
sandbox.images[0].dockerfile-dir=docker/coderunner-java
sandbox.image-python=coderunner-python
sandbox.images[1].image-name=${sandbox.image-python}
sandbox.images[1].dockerfile-dir=docker/coderunner-python
```

These images are **built automatically on first startup** (via `SandboxImageInitializer`) if they don't already exist locally — no manual `docker build` step needed. First run will take a bit longer than subsequent ones while the images build; check the startup logs for `[SandboxImageInitializer]` lines to confirm it completed successfully before submitting a programming task.

## Running

Load the environment variables and start the app (Bash terminal):

```bash
    set -o allexport; source .env; set +o allexport
    ./gradlew bootRun
```

Confirm it's running by visiting `http://localhost:8080` (or your configured `SERVER_PORT`). API docs are available at `http://localhost:8080/swagger-ui.html` (disabled in the `prod` profile).

**Note:** ensure Docker Desktop (or the Docker daemon) is running locally before starting the app, programming-task submission and judging will fail otherwise, since `SandboxRunner` shells out to the local `docker` CLI directly.

Design-task submissions are rendered with Playwright (headless Chromium), which is downloaded on first use. If it fails to launch on Linux, install it with its system dependencies:

```bash
    ./gradlew playwright --args="install --with-deps chromium"
```

## Running in Docker

1. Setup network

```bash
    docker network create jobhub-network
```

2. Run redis container

```bash
    docker run -d --name redis --network jobhub-network redis:latest
```

3. Build the image (based on the Playwright Java image, so Chromium is included):

```bash
    docker build -t jobhub .
```

4. Run the container using the same `.env` file **and the Docker socket mounted** (required for programming-task judging):

```bash
    docker run -d --name jobhub --network jobhub-network --env-file .env \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -p 8080:8080 jobhub
```

## Viewing Logs

- **Local:** output appears in the terminal running `bootRun`
- **Docker:**

  ```bash
  docker logs -f jobhub
  ```
