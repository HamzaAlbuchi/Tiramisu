# Build context = frontend/ only (must not use repo-root Dockerfile that COPYs ../backend).
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve@14.2.4
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts/inject-api-base.cjs ./inject-api-base.cjs

ENV PORT=8080
EXPOSE 8080

# Inject API origin into index.html from VITE_API_BASE_URL (runtime on Railway).
CMD ["sh", "-c", "node inject-api-base.cjs && serve dist -s -l tcp://0.0.0.0:${PORT}"]
