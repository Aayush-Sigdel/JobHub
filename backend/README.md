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
SERVER_PORT=8080
```
## Running

Load the environment variables and start the app (Bash terminal):
```bash
    set -o allexport; source .env; set +o allexport
    ./gradlew bootRun
```

Confirm it's running by visiting `http://localhost:8080` (or your configured `SERVER_PORT`).

## Running in Docker


1. Build the image:

    ```bash
    docker build -t jobhub-backend:latest .
    ```

2. Run the container using the same `.env` file:

    ```bash
    docker run -d --name jobhub-backend --env-file .env -p 8080:8080 jobhub-backend:latest
    ```

## Viewing Logs

- **Local:** output appears in the terminal running `bootRun`
- **Docker:**

    ```bash
    docker logs -f jobhub-backend
    ```
