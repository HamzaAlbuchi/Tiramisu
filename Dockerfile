# Railway (and other hosts) expect a Dockerfile at the repo root.
# The Spring Boot app lives in backend/ — copy only that module into the build context.
FROM maven:3.8-eclipse-temurin-8 AS builder
WORKDIR /build

COPY backend/ .

RUN mvn -B package -DskipTests

FROM eclipse-temurin:8-jre-alpine
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
