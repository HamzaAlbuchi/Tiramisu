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

# Inject runtime config into dist/index.html (Railway env available here, not only at `vite build`):
# - VITE_API_BASE_URL → window.__TIRAMISU_API_BASE__
# - VITE_REQUIRE_INVITE_KEY or TIRAMISU_REQUIRE_INVITE → window.__TIRAMISU_REQUIRE_INVITE__ ("true"|"false")
CMD ["sh", "-c", "node inject-api-base.cjs && serve dist -s -l tcp://0.0.0.0:${PORT}"]
