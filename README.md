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

## Docker

**From the repo root** (same layout Railway uses):

```bash
docker build -t tiramisu .
docker run -p 8080:8080 -e PORT=8080 tiramisu
```

To build only the backend folder as context (optional):

```bash
docker build -t tiramisu-backend ./backend
docker run -p 8080:8080 -e PORT=8080 tiramisu-backend
```

### Railway (two services)

Railway does **not** create two services automatically: add both from the same GitHub repo.

**Config file + watch paths:** Railway does **not** load `railway.toml` from your service Root Directory automatically. Point each service at **one** config file so watch patterns stay separate; otherwise both services may deploy on every push.

| Service | Root Directory | Config as code path (service settings) |
|--------|----------------|----------------------------------------|
| API | *(empty)* | `/backend/railway.toml` |
| Web | `frontend` | `/frontend/railway.toml` |

1. **API**
   - New → GitHub repo → leave **Root Directory** empty (repo root).
   - Set **Config as code** → `/backend/railway.toml` (watch patterns: root `Dockerfile`, `backend/**` only).
   - Root `Dockerfile` is auto-detected for the build.

2. **Web (Vite SPA)**
   - New → **same repo** → **Root Directory** `frontend`.
   - Set **Config as code** → `/frontend/railway.toml` (`Dockerfile` builder; deploy only when `frontend/**` changes).
   - If you see `"/backend": not found`, the web service is using the **repo-root** image — confirm Root Directory is `frontend` and that this config path is set.

**Variables**

| Service | Variable | Purpose |
|--------|-----------|---------|
| Web | `VITE_API_BASE_URL` | Public origin of the **API** (e.g. `https://backend-production-4ceb.up.railway.app`, no trailing slash). With the **Dockerfile** frontend, it is applied when the **container starts** (see `api-config.js`); change the var → restart/redeploy. |
| API | `APP_CORS_ORIGINS` | Comma-separated list of allowed origins; include your **Web** URL, e.g. `https://your-web.up.railway.app`. |

Deploy **API** first, copy its public URL into `VITE_API_BASE_URL` on the Web service, redeploy Web. Set `APP_CORS_ORIGINS` on the API to include the Web URL so the browser can call the API.

Alternatively, for API-only again: set service **Root Directory** to `backend` and use `backend/Dockerfile`; root `Dockerfile` is for “monorepo root” deploys.

## CI

GitLab CI runs Maven from **`backend/`** (see `.gitlab-ci.yml`).

## Licence

See `LICENSE`. The project started from a GitLab Spring template; island and debate code are specific to this repository.
