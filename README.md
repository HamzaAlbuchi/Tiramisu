# Tiramisu · Hello World Island Simulation

A **Java / Spring Boot** project with two experiences:

1. **Main UI (`/`, `index.html`)** — **Multi-model debate**: you enter a topic and a number of exchange turns; two stub “models” (Model A / Model B) alternate; a **judge** returns a verdict with **hallucination bias** and **accuracy** notes (plus heuristic scores). Replace `DebateService` with real LLM calls when you are ready.
2. **Secondary UI (`/world.html`)** — **Island agent simulation** (Island-1): acting agents on a grid, council evaluation, and a monitoring dashboard.

The island simulation is prepared for pluggable **LLM brains** so each agent can later be driven by a different language model.

**Live demo:** [https://tiramisu-production.up.railway.app/](https://tiramisu-production.up.railway.app/) · [Agent World](https://tiramisu-production.up.railway.app/world.html)

---

## What This Project Does

- **Multi-model debate** (`/`): POST `/api/debate/run` with `{ "topic": "...", "exchanges": 6 }` returns a transcript and `verdict` (`summary`, `hallucinationBias`, `accuracyAssessment`, `hallucinationRiskScore`, `accuracySignalScore`). The current debaters and judge use **template + keyword heuristics**, not remote models.
- **World model**: A 14×10 grid with terrain (water, sand, palm grove, grass, lagoon, rocky cliff). Time advances in discrete **ticks**.
- **Acting agents** (Eos, Bony, Nova): move on the grid, produce thoughts and world events; their trails are recorded as paths. Only they appear on the world map.
- **Council** (observer agents): **Dr. Selim** (Doctor), **Dr. Mira** (Psychologist), and **Arbitra** (Judge) do **not** move. They evaluate the world after each tick and update the **Council** data structure:
  - **Doctor**: observes reasoning anomalies, appends **diagnostics** (e.g. hallucination-style indicators).
  - **Psychologist**: tracks behaviour patterns, records **behaviour notes** per acting agent.
  - **Judge**: detects **conflicts** (e.g. two acting agents in the same cell) and appends to the conflict log.
- **Council evaluation loop**: Each tick, acting agents decide and move first; then council agents analyze the new state and events and update `council.diagnostics`, `council.behaviourNotes`, and `council.conflicts`. The purpose is **AI-to-AI behavior verification**: the council evaluates and verifies the behavior of acting agents without moving in the world. The design supports later **LLM-powered council agents** (same `AgentBrain` interface; they simply do not return movement deltas and only write to `world.getCouncil()`).
- **Web UI** (`/world.html`, secondary): futuristic **Agent World** dashboard — council panel, world map (acting agents only), agent cards, event feed. Link back to `/` for the debate console.

**Acting agents vs Council**

| | Acting agents (Eos, Bony, Nova) | Council (Doctor, Psychologist, Judge) |
|---|----------------------------------|---------------------------------------|
| **Move on grid** | Yes | No |
| **Role** | Generate actions, thoughts, events | Observe and evaluate; write to `council` |
| **Data** | Position, path, thought, memory | `council.diagnostics`, `council.behaviourNotes`, `council.conflicts` |

---

## Tech Stack

- **Java 8**, **Spring Boot 2.5.5**
- **Maven** (wrapper: `mvnw` / `mvnw.cmd`)
- **JUnit 5** for unit tests
- **GitLab CI** pipeline: build, test, optional manual deploy

---

## How to Run

### Prerequisites

- **JDK 8** (or compatible). Set `JAVA_HOME` to your JDK install.
- **Maven** (optional if you use the wrapper).

### Build and run

```bash
# from project root
./mvnw spring-boot:run
```

On Windows:

```cmd
mvnw.cmd spring-boot:run
```

Then open:

- **Debate console (main)**: [http://localhost:8080/](http://localhost:8080/)
- **Island simulation (secondary)**: [http://localhost:8080/world.html](http://localhost:8080/world.html)

On **world.html**, use **Step** to advance by one or more ticks, **Auto-run** to run continuously, and **Reset** to reinitialize the island and all agents.

### Run tests

```bash
./mvnw test
```

Unit tests cover the core world and agent classes (e.g. `Agent`, `WorldState`, `WorldEvent`, `AgentDecision`, `Position`) under `src/test/java/com/example/demo/world/`.

---

## Project Layout (main parts)

```
src/main/java/com/example/demo/
├── DemoApplication.java          # Spring Boot entry point
├── debate/
│   ├── DebateController.java     # POST /api/debate/run
│   ├── DebateService.java        # Stub debaters + judge (replace with LLMs)
│   └── …                       # DebateResult, DebateVerdict, DebateExchange, DebateRequest
└── world/
    ├── Agent.java                # Agent with role, location, thought, memory, position, path
    ├── AgentBrain.java           # Interface: decide(WorldState, Agent) → AgentDecision
    ├── AgentDecision.java        # Thought + event text + optional (deltaX, deltaY)
    ├── AgentRole.java            # FIRST_LIFE, PET_DOG, EXPLORER, DOCTOR, PSYCHOLOGIST, JUDGE
    ├── Position.java             # (x, y) for path and grid
    ├── TerrainType.java          # WATER, SAND, PALM_GROVE, etc.
    ├── WorldEvent.java           # Tick + timestamp + description
    ├── WorldState.java           # Tick, grid, terrain, agents, events, council
    ├── Council.java              # Council data: diagnostics, behaviourNotes, conflicts
    ├── WorldService.java         # Tick loop: acting agents then council evaluation
    ├── WorldController.java      # REST: /api/world/state, /reset, /step
    ├── RuleBasedPioneerBrain.java
    ├── RuleBasedPetBrain.java
    ├── RuleBasedExplorerBrain.java
    ├── RuleBasedDoctorBrain.java
    ├── RuleBasedPsychologistBrain.java
    └── RuleBasedJudgeBrain.java

src/main/resources/static/
├── index.html                    # Main: AI Debate Arena (links styles.css + app.js)
├── styles.css                    # Debate UI styles
├── app.js                        # Debate UI logic (fetch /api/debate/run)
└── world.html                    # Secondary: island simulation dashboard

src/test/java/com/example/demo/
├── DemoApplicationTests.java     # Spring context + home endpoint
└── world/
    ├── AgentTest.java
    ├── WorldStateTest.java
    ├── WorldEventTest.java
    ├── AgentDecisionTest.java
    └── PositionTest.java
```

---

## API (relevant for the UI)

| Method | Path | Description |
|--------|------|--------------|
| GET  | `/` or `/index.html` | Main debate UI (static). |
| POST | `/api/debate/run`    | Body: `{ "topic": "string", "exchanges": 6 }` — transcript + judge **verdict** (hallucination / accuracy fields). |
| GET  | `/api/world/state`   | Full world state (tick, terrain, agents, events, **council**: `{ diagnostics, behaviourNotes, conflicts }`). |
| POST | `/api/world/reset`   | Reset world: new terrain, agents at initial positions, cleared events. |
| POST | `/api/world/step?ticks=N` | Advance simulation by `N` ticks (default 1); returns updated state. |

---

## Deploy on Railway

The app is set up for [Railway](https://railway.app):

1. **Port and binding**: `application.properties` uses `server.port=${PORT:8080}` and `server.address=0.0.0.0` so Railway’s proxy can reach the app.
2. **Dockerfile**: Multi-stage build (Maven → Eclipse Temurin 8 JRE); the run stage uses `PORT` so the process listens on Railway’s assigned port.

**Steps:**

- Connect your repo to Railway and create a new service.
- Railway will detect the **Dockerfile** and build the image, then run the container. No extra build/start commands are required.
- Railway sets `PORT` automatically; the app reads it and listens on `0.0.0.0:PORT`.
- After deploy, open your service URL (e.g. `https://your-app.up.railway.app`) and go to `/world.html` for the island UI.

To test the image locally with a custom port:

```bash
docker build -t tiramisu .
docker run -p 8080:8080 -e PORT=8080 tiramisu
```

---

## CI/CD

The repository includes a **GitLab CI** pipeline (`.gitlab-ci.yml`):

- **build**: `mvn clean package -DskipTests`, stores JARs.
- **test**: `mvn test` (depends on build).
- **deploy**: Manual job; placeholder for your deployment (e.g. container or server).

Runners use the Maven + Eclipse Temurin 8 image (Maven from the image, not the wrapper); the pipeline caches `.m2/repository` to speed up builds.

---

## Extending the Project

- **LLM debate**: In `DebateService`, replace `buildArgumentA` / `buildArgumentB` / `buildVerdict` with calls to your model endpoints; keep the same JSON shape for the UI.
- **LLM brains**: Implement `AgentBrain` with a class that calls your LLM API, maps the response to a thought + event + optional `(deltaX, deltaY)`, and returns an `AgentDecision`. In `WorldService`, assign that brain to the desired agent(s) instead of the rule-based brain.
- **New roles**: Add an enum value to `AgentRole`, create an agent and a brain (rule-based or LLM), register them in `WorldService` and in the UI state/dashboard/map if needed.
- **Council**: The **Council** holds `diagnostics`, `behaviourNotes`, and `conflicts`. Council agents (Doctor, Psychologist, Judge) do not move; they run after acting agents each tick. To add LLM-powered council agents, implement `AgentBrain` so that the decision only updates `world.getCouncil()` and returns a thought/event (no movement deltas).
- **Alliances**: Add logic to record alliances (e.g. when two acting agents cooperate) and surface them in the UI.

---

## Licence and template

This project started from a GitLab [Spring project template](https://gitlab.com/gitlab-org/project-templates/spring). The island simulation, world model, and UI are specific to this repository.
