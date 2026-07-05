FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle* ./

RUN chmod +x ./gradlew

COPY . .

RUN ./gradlew --no-daemon bootJar -x test

FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
