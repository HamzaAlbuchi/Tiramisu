# Tiramisu

**Tiramisu** is a small full-stack app built around a **model debate**: two models argue a topic in turns, then a judge-style **evaluation** is available only after you have watched the exchange. The UI is designed so the verdict feels **earned**, not dumped next to the transcript.

Stack: **Spring Boot** (Java 8) **backend** and a **React + TypeScript + Vite + Tailwind** **frontend**. The island world simulation remains on the backend as **REST only** (`/api/world/*`); there is no bundled static HTML UI for it.

---

## Debate feature (what you get)

1. **Debate first**  
   While the run plays out, the screen stays on the **conversation**. No winner, scores, or rubric in the main layout.

2. **Chat-style feed**  
   Pro and Against appear as **left / right** bubbles with subtle color cues. Messages reveal **progressively** with a short **thinking** state between turns.

3. **Newest message on top**  
   The feed reads like a **live timeline**: the latest turn stays at the top; older turns sit below.

4. **Evaluation when you are ready**  
   After the last turn, a short pause, then **View evaluation** appears. Opening it shows a **modal** (dimmed backdrop) with **winner**, **confidence**, **summary**, **metrics**, and deeper **judge notes** (strengths, weaknesses, rationale).

5. **Export**  
   You can still **Export JSON** from the header for the full `POST /api/debate` response.

**Try it locally:** run backend + frontend (below), enter a topic and rounds in the header, submit, and watch the feed before opening the evaluation.

---

## Debate API

`POST /api/debate` with JSON:

```json
{ "topic": "string", "rounds": 3, "style": "balanced" }
```

- **`rounds`** — Number of Pro+Against pairs (capped by the backend).
- **`style`** — One of `balanced`, `formal`, `casual`, `technical` (register/tone hints for the run).

**Response** includes `topic`, `style`, `rounds`, `exchangeCount`, `models` (`pro`, `against`), chronological **`turns[]`** (the frontend orders them for the “newest first” feed), and **`evaluation`** (`winner`, `winnerLabel`, `confidence`, `verdictType`, risk/signal scores, `metrics`, `analysis`).

---

## Layout

| Path | Role |
|------|------|
| **`backend/`** | Spring Boot app, Maven wrapper, `Dockerfile` (build context = this folder). |
| **`frontend/`** | Vite SPA; in dev, `/api` is proxied to `http://localhost:8080`. |

---

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

Open the URL Vite prints (default `http://localhost:5173`). Set CORS in `backend/src/main/resources/application.properties` (`app.cors.allowed-origins`) if you use another dev port.

**Production API URL for the SPA:** set `VITE_API_BASE_URL` (see `frontend/.env.example`). Empty in dev uses the Vite proxy.

---

## World simulation API

Separate from the debate flow. Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/world/state` | Full world JSON |
| POST | `/api/world/reset` | Reset simulation |
| POST | `/api/world/step?ticks=N` | Advance ticks |

Build your own client against these if you need the grid again.

---

## Docker

**From the repo root** (same layout Railway uses):

```bash
docker build -t tiramisu .
docker run -p 8080:8080 -e PORT=8080 tiramisu
```

Backend-only image (optional):

```bash
docker build -t tiramisu-backend ./backend
docker run -p 8080:8080 -e PORT=8080 tiramisu-backend
```

### Railway (two services)

Railway does **not** create two services automatically: add both from the same GitHub repo.

**Config file + watch paths:** Point each service at **one** config file so watch patterns stay separate; otherwise both services may deploy on every push.

| Service | Root Directory | Config as code path (service settings) |
|--------|----------------|----------------------------------------|
| API | *(empty)* | `/backend/railway.toml` |
| Web | `frontend` | `/frontend/railway.toml` |

1. **API** — Root Directory empty → **Config as code** `/backend/railway.toml` (root `Dockerfile`, `backend/**`).
2. **Web** — Root Directory `frontend` → **Config as code** `/frontend/railway.toml` (Dockerfile builder; `frontend/**` only).

If you see `"/backend": not found` on the web service, it is building from the **repo root** — confirm Root Directory is `frontend` and the config path above.

**If both services redeploy on every commit:** each service must use **its own** “Config as code” file. If one service shares the wrong file or a single root `railway.toml`, watch rules can overlap.

**Variables**

| Service | Variable | Purpose |
|--------|-----------|---------|
| Web | `VITE_API_BASE_URL` | Public origin of the **API** (no trailing slash). With the frontend Dockerfile, applied at container start (`api-config.js`); change → redeploy/restart. |
| API | `APP_CORS_ORIGINS` | Comma-separated allowed origins; include your **Web** URL. |

Deploy **API** first, set `VITE_API_BASE_URL` on Web, then set `APP_CORS_ORIGINS` on the API.

API-only from monorepo: Root Directory `backend` and `backend/Dockerfile`; root `Dockerfile` is for repo-root deploys.

---

## CI

GitLab CI runs Maven from **`backend/`** (see `.gitlab-ci.yml`).

---

## Licence

See `LICENSE`. The project started from a GitLab Spring template; island and debate code are specific to this repository.
