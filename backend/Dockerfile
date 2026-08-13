FROM gradle:8-jdk17 AS build

WORKDIR /workspace

COPY . .

RUN ./gradlew --no-daemon bootJar -x test


FROM mcr.microsoft.com/playwright/java:v1.62.0-noble

WORKDIR /app

COPY --from=build /workspace/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]