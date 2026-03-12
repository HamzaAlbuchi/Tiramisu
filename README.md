# Tiramisu · Hello World Island Simulation

A **multi-agent island simulation** built with Java and Spring Boot. The project simulates a small world (Island-1) where agents with different roles—first life, pet, doctor, psychologist, judge—move on a grid, record thoughts and events, and are observed through a web UI. The design is prepared for pluggable **LLM brains** so each agent can later be driven by a different language model.

---

## What This Project Does

- **World model**: A 14×10 grid with terrain (water, sand, palm grove, grass, lagoon, rocky cliff). Time advances in discrete **ticks**.
- **Agents**:
  - **Eos** (first life) and **Bony** (dog) wander the island each tick; their “brains” produce a thought and an optional movement. Their trails are recorded as paths.
  - **Dr. Selim** (doctor), **Dr. Mira** (psychologist), and **Arbitra** (judge) observe the world: the doctor tracks hallucination-style indicators, the psychologist keeps behaviour notes per agent, and the judge keeps a conflict log (and an alliances list for future use).
- **Brains**: Each agent has an `AgentBrain` (e.g. `RuleBasedPioneerBrain`, `RuleBasedPetBrain`). The interface returns an `AgentDecision` (thought, world-event text, optional movement). This makes it easy to **swap in LLM-backed brains** later without changing the rest of the simulation.
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
    ├── AgentRole.java            # FIRST_LIFE, PET_DOG, DOCTOR, PSYCHOLOGIST, JUDGE
    ├── Position.java             # (x, y) for path and grid
    ├── TerrainType.java          # WATER, SAND, PALM_GROVE, etc.
    ├── WorldEvent.java           # Tick + timestamp + description
    ├── WorldState.java           # Tick, grid, terrain, agents, events, tracking maps
    ├── WorldService.java         # Builds terrain, resets world, advances ticks, applies brains
    ├── WorldController.java      # REST: /api/world/state, /reset, /step
    ├── RuleBasedPioneerBrain.java
    ├── RuleBasedPetBrain.java
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

## CI/CD

The repository includes a **GitLab CI** pipeline (`.gitlab-ci.yml`):

- **build**: `./mvnw clean package -DskipTests`, stores JARs.
- **test**: `./mvnw test` (depends on build).
- **deploy**: Manual job; placeholder for your deployment (e.g. container or server).

Runners use the Maven + Eclipse Temurin 8 image; the pipeline caches `.m2/repository` to speed up builds.

---

## Extending the Project

- **LLM brains**: Implement `AgentBrain` with a class that calls your LLM API, maps the response to a thought + event + optional `(deltaX, deltaY)`, and returns an `AgentDecision`. In `WorldService`, assign that brain to the desired agent(s) instead of the rule-based brain.
- **New roles**: Add an enum value to `AgentRole`, create an agent and a brain (rule-based or LLM), register them in `WorldService` and in the UI state/dashboard/map if needed.
- **Conflicts / alliances**: The judge and the world state already have `conflictLog` and `alliances`; add logic in the judge (or elsewhere) to detect conflicts and record alliances, and surface them in the UI.

---

## Licence and template

This project started from a GitLab [Spring project template](https://gitlab.com/gitlab-org/project-templates/spring). The island simulation, world model, and UI are specific to this repository.
