# Backend

This README explains how to start the Java backend (Spring Boot) for this project.

## Prerequisites

- JDK 17
- Docker (optional)
- Git (to clone repo)

## Default Address

The backend listens on `SERVER_PORT` (default `8080`). Use `SPRING_APPLICATION_JSON` or `SERVER_PORT` to change it.

## Environment Variables

Provide at minimum (example names):

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>
SPRING_DATASOURCE_USERNAME=<db-user>
SPRING_DATASOURCE_PASSWORD=<db-pass>
SPRING_REDIS_HOST=<redis-host>
SPRING_MAIL_HOST=<smtp-host>
SPRING_MAIL_PORT=<smtp-port>
SPRING_MAIL_USERNAME=<smtp-user>
SPRING_MAIL_PASSWORD=<smtp-pass>
JWT_SECRET=<jwt-secret>
REDIS_HOST=redis
REDIS_PORT=6379
```

## Sandbox Images

Programming-task submissions are judged inside isolated Docker containers, built from images defined in `application.properties`:

```properties
sandbox.image-java=coderunner-java
sandbox.images[0].image-name=${sandbox.image-java}
sandbox.images[0].dockerfile-dir=docker/coderunner-java
```

These images are **built automatically on first startup** (via `SandboxImageInitializer`) if they don't already exist locally — no manual `docker build` step needed. First run will take a bit longer than subsequent ones while the image builds; check the startup logs for `[SandboxImageInitializer]` lines to confirm it completed successfully before submitting a programming task.

## Running

Load the environment variables and start the app (Bash terminal):
```bash
    set -o allexport; source .env; set +o allexport
    ./gradlew bootRun
```

Confirm it's running by visiting `http://localhost:8080` (or your configured `SERVER_PORT`).

**Note:** ensure Docker Desktop (or the Docker daemon) is running locally before starting the app, programming-task submission and judging will fail otherwise, since `SandboxRunner` shells out to the local `docker` CLI directly.

## Running in Docker

1. Setup network
```bash
    docker network create jobhub-network
```
2. Run redis container
```bash
    docker run -d --name redis --network jobhub-network redis:latest
```
3. Build the image:
```bash
    docker build -t jobhub .
```
4. Run the container using the same `.env` file **and the Docker socket mounted** (required — see below):
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
