# Build stage (Debian-based image for reliable Maven/dependency resolution)
# Build with context = backend/:  docker build -t tiramisu-backend ./backend
FROM maven:3.8-eclipse-temurin-8 AS builder
WORKDIR /build

# Copy backend module; .dockerignore excludes target, .git, etc.
COPY . .

RUN mvn -B package -DskipTests

# Run stage (Railway sets PORT at runtime)
FROM eclipse-temurin:8-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

# Default port when PORT not set (e.g. local docker run)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
