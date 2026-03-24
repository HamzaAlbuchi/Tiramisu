# Tiramisu

Spring Boot **backend** (Java 8) plus a **React + TypeScript + Vite + Tailwind** **frontend** for the model-debate experience. The island simulation still lives in the backend as **REST only** (`/api/world/*`); static HTML UIs were removed in favor of the SPA.

## Layout

- **`backend/`** — Spring Boot app, Maven wrapper, `Dockerfile` (build context = this folder).
- **`frontend/`** — Vite SPA; in dev, `/api` is proxied to `http://localhost:8080`.

## Run locally

**Backend** (JDK 8+; set `JAVA_HOME` if the wrapper complains):

```bash
cd backend
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

**Frontend** (Node 18+):

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`). Configure CORS origins in `backend/src/main/resources/application.properties` (`app.cors.allowed-origins`) if you use another dev port.

**Production API URL for the SPA:** set `VITE_API_BASE_URL` (see `frontend/.env.example`). Empty in dev uses the Vite proxy.

## Debate API

`POST /api/debate` with JSON:

```json
{ "topic": "string", "rounds": 3, "style": "balanced" }
```

`rounds` = number of Pro+Against pairs (capped by the backend). `style` is one of `balanced`, `formal`, `casual`, `technical` (stub prefixes only).

Response includes `topic`, `style`, `rounds`, `exchangeCount`, `models` (`pro`, `against`), `turns[]`, and `evaluation` (`winner`, `winnerLabel`, `confidence`, `verdictType`, risk/signal scores, `metrics`, `analysis`).

## World simulation API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/world/state` | Full world JSON |
| POST | `/api/world/reset` | Reset simulation |
| POST | `/api/world/step?ticks=N` | Advance ticks |

Build a separate UI against these endpoints if you need the grid again.

## Docker (backend)

From the repo root:

```bash
docker build -t tiramisu-backend ./backend
docker run -p 8080:8080 -e PORT=8080 tiramisu-backend
```

## CI

GitLab CI runs Maven from **`backend/`** (see `.gitlab-ci.yml`).

## Licence

See `LICENSE`. The project started from a GitLab Spring template; island and debate code are specific to this repository.
