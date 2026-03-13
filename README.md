# Tiramisu · Hello World Island Simulation

A **multi-agent island simulation** built with Java and Spring Boot. The project simulates a small world (Island-1) where agents with different roles—first life, pet, explorer, doctor, psychologist, judge—move on a grid, record thoughts and events, and are observed through a web UI. The judge detects and logs **conflicts** when two agents occupy the same cell. The design is prepared for pluggable **LLM brains** so each agent can later be driven by a different language model.

---

## What This Project Does

- **World model**: A 14×10 grid with terrain (water, sand, palm grove, grass, lagoon, rocky cliff). Time advances in discrete **ticks**.
- **Agents**:
  - **Eos** (first life), **Bony** (dog), and **Nova** (explorer) wander the island each tick; their “brains” produce a thought and an optional movement. Their trails are recorded as paths.
  - **Dr. Selim** (doctor), **Dr. Mira** (psychologist), and **Arbitra** (judge) observe the world: the doctor tracks hallucination-style indicators, the psychologist keeps behaviour notes per agent, and the judge **detects conflicts** (when two agents share the same cell) and records them in the conflict log. An alliances list is available for future use.
- **Brains**: Each agent has an `AgentBrain` (e.g. `RuleBasedPioneerBrain`, `RuleBasedPetBrain`, `RuleBasedExplorerBrain`). The interface returns an `AgentDecision` (thought, world-event text, optional movement). This makes it easy to **swap in LLM-backed brains** later without changing the rest of the simulation.
- **Web UI** (`/world.html`): Dashboard (population, conflicts, hallucination flags, alliances), a **world map** (terrain, agent positions, movement paths, interaction highlights when two agents share a cell), agent cards with thoughts and memory counts, and a news-style event feed. You can step the simulation or run it automatically.

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

- **App**: [http://localhost:8080/](http://localhost:8080/)
- **Island simulation UI**: [http://localhost:8080/world.html](http://localhost:8080/world.html)

Use **Step** to advance by one or more ticks, **Auto-run** to run continuously, and **Reset world** to reinitialize the island and all agents.

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
└── world/
    ├── Agent.java                # Agent with role, location, thought, memory, position, path
    ├── AgentBrain.java           # Interface: decide(WorldState, Agent) → AgentDecision
    ├── AgentDecision.java        # Thought + event text + optional (deltaX, deltaY)
    ├── AgentRole.java            # FIRST_LIFE, PET_DOG, EXPLORER, DOCTOR, PSYCHOLOGIST, JUDGE
    ├── Position.java             # (x, y) for path and grid
    ├── TerrainType.java          # WATER, SAND, PALM_GROVE, etc.
    ├── WorldEvent.java           # Tick + timestamp + description
    ├── WorldState.java           # Tick, grid, terrain, agents, events, tracking maps
    ├── WorldService.java         # Builds terrain, resets world, advances ticks, applies brains
    ├── WorldController.java      # REST: /api/world/state, /reset, /step
    ├── RuleBasedPioneerBrain.java
    ├── RuleBasedPetBrain.java
    ├── RuleBasedExplorerBrain.java
    ├── RuleBasedDoctorBrain.java
    ├── RuleBasedPsychologistBrain.java
    └── RuleBasedJudgeBrain.java

src/main/resources/static/
└── world.html                    # Island UI: map, dashboard, agent cards, events

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
| GET  | `/api/world/state`   | Full world state (tick, terrain, agents with positions/paths, events, dashboard data). |
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

- **LLM brains**: Implement `AgentBrain` with a class that calls your LLM API, maps the response to a thought + event + optional `(deltaX, deltaY)`, and returns an `AgentDecision`. In `WorldService`, assign that brain to the desired agent(s) instead of the rule-based brain.
- **New roles**: Add an enum value to `AgentRole`, create an agent and a brain (rule-based or LLM), register them in `WorldService` and in the UI state/dashboard/map if needed.
- **Conflicts / alliances**: The judge **detects conflicts** when two agents occupy the same grid cell and appends entries to `conflictLog`; the dashboard shows the count. Add logic elsewhere to record **alliances** (e.g. when two agents cooperate) and surface them in the UI.

---

## Licence and template

This project started from a GitLab [Spring project template](https://gitlab.com/gitlab-org/project-templates/spring). The island simulation, world model, and UI are specific to this repository.
