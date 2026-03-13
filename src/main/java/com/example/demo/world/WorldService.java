package com.example.demo.world;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Runs the simulation loop: acting agents decide and move; then council agents
 * evaluate the new state and update council data (diagnostics, behaviour notes, conflicts).
 * Council agents do not move on the grid. This separation allows later extension
 * with LLM-powered council agents for AI-to-AI behavior verification.
 */
@Service
public class WorldService {

    private final WorldState state;
    private final AgentBrain pioneerBrain;
    private final AgentBrain petBrain;
    private final AgentBrain explorerBrain;
    private final AgentBrain doctorBrain;
    private final AgentBrain psychologistBrain;
    private final AgentBrain judgeBrain;

    public WorldService() {
        this.state = new WorldState();
        this.pioneerBrain = new RuleBasedPioneerBrain();
        this.petBrain = new RuleBasedPetBrain();
        this.explorerBrain = new RuleBasedExplorerBrain();
        this.doctorBrain = new RuleBasedDoctorBrain();
        this.psychologistBrain = new RuleBasedPsychologistBrain();
        this.judgeBrain = new RuleBasedJudgeBrain();
        resetWorld();
    }

    public synchronized void resetWorld() {
        buildTerrain();

        Agent pioneer = new Agent("Eos", AgentRole.FIRST_LIFE, "Island-1:shore");
        pioneer.setCurrentThought("I am awake, alone on this island. Is there any other life out here?");
        pioneer.remember("Awakening as the first life on Island-1.");
        placeAgent(pioneer, 3, 1);
        pioneer.addPathPoint(3, 1);

        Agent pet = new Agent("Bony", AgentRole.PET_DOG, "Island-1:shore");
        pet.setCurrentThought("I stay close to Eos, ears up and tail ready to wag.");
        pet.remember("First memory: the sound of waves and Eos' voice.");
        placeAgent(pet, 5, 1);
        pet.addPathPoint(5, 1);

        Agent explorer = new Agent("Nova", AgentRole.EXPLORER, "Island-1:shore");
        explorer.setCurrentThought("I just arrived on this island. I wonder who else is here.");
        explorer.remember("Washed ashore on the far side of Island-1.");
        placeAgent(explorer, 8, 1);
        explorer.addPathPoint(8, 1);

        Agent doctor = new Agent("Dr. Selim", AgentRole.DOCTOR, "Island-1:infirmary-tent");
        doctor.setCurrentThought("I will monitor the minds on this island for signs of strain.");
        doctor.remember("Arrived to quietly observe the first minds on Island-1.");
        placeAgent(doctor, 2, 4);
        doctor.addPathPoint(2, 4);

        Agent psychologist = new Agent("Dr. Mira", AgentRole.PSYCHOLOGIST, "Island-1:cliff-overlook");
        psychologist.setCurrentThought("I watch how isolation shapes behaviour and coping strategies.");
        psychologist.remember("Assigned to analyse the emotional landscape of Island-1.");
        placeAgent(psychologist, 11, 3);
        psychologist.addPathPoint(11, 3);

        Agent judge = new Agent("Arbitra", AgentRole.JUDGE, "Island-1:stone-circle");
        judge.setCurrentThought("I will remain impartial, recording conflicts should they arise.");
        judge.remember("Took an oath to keep balance and fairness on Island-1.");
        placeAgent(judge, 6, 6);
        judge.addPathPoint(6, 6);

        state.setTick(0L);
        state.getCouncil().clear();
        state.setPioneer(pioneer);
        state.setCompanion(pet);
        state.setExplorer(explorer);
        state.setDoctor(doctor);
        state.setPsychologist(psychologist);
        state.setJudge(judge);
        state.addEvent(new WorldEvent(
                state.getTick(),
                "Breaking: Eos and Bony awaken on Island-1; Nova the explorer reaches the shore. A small observing council (doctor, psychologist, judge) is in place."
        ));
    }

    private void buildTerrain() {
        int w = WorldState.GRID_WIDTH;
        int h = WorldState.GRID_HEIGHT;
        List<List<String>> grid = new ArrayList<>();
        for (int y = 0; y < h; y++) {
            List<String> row = new ArrayList<>();
            for (int x = 0; x < w; x++) {
                row.add(terrainAt(x, y, w, h));
            }
            grid.add(row);
        }
        state.setTerrain(grid);
        state.setGridWidth(w);
        state.setGridHeight(h);
    }

    private String terrainAt(int x, int y, int w, int h) {
        double cx = (w - 1) / 2.0;
        double cy = (h - 1) / 2.0;
        double dx = (x - cx) / (w * 0.45);
        double dy = (y - cy) / (h * 0.5);
        double r = dx * dx + dy * dy;
        if (r > 1.0) return TerrainType.WATER.name();
        if (y <= 1 && r < 0.7) return TerrainType.SAND.name();
        if (y >= h - 2 && r < 0.6) return TerrainType.SAND.name();
        if (r < 0.25) return TerrainType.GRASS.name();
        if (x < 3 || x > w - 4) return TerrainType.ROCKY_CLIFF.name();
        if (y >= 4 && y <= 6 && x >= 5 && x <= 9) return TerrainType.LAGOON_EDGE.name();
        if (r < 0.5) return TerrainType.PALM_GROVE.name();
        return TerrainType.SAND.name();
    }

    private void placeAgent(Agent agent, int x, int y) {
        agent.setPositionX(x);
        agent.setPositionY(y);
    }

    private void applyMovement(Agent agent, AgentDecision decision) {
        if (agent == null || decision == null || decision.getDeltaX() == null || decision.getDeltaY() == null) {
            return;
        }
        int nx = Math.max(0, Math.min(state.getGridWidth() - 1, agent.getPositionX() + decision.getDeltaX()));
        int ny = Math.max(0, Math.min(state.getGridHeight() - 1, agent.getPositionY() + decision.getDeltaY()));
        if (state.isWalkable(nx, ny)) {
            agent.setPositionX(nx);
            agent.setPositionY(ny);
            agent.addPathPoint(nx, ny);
        }
    }

    public synchronized WorldState getState() {
        return state;
    }

    public synchronized WorldState step(long ticks) {
        if (ticks < 1) {
            ticks = 1;
        }
        for (int i = 0; i < ticks; i++) {
            advanceOneTick();
        }
        return state;
    }

    /**
     * Tick loop: (1) Acting agents decide, move, and generate events;
     * (2) Council agents evaluate state/events and update council logs (no movement).
     */
    private void advanceOneTick() {
        long nextTick = state.getTick() + 1;
        state.setTick(nextTick);

        // --- Acting agents: decide, move, record events ---
        runActingAgent(state.getPioneer(), pioneerBrain, nextTick);
        runActingAgent(state.getCompanion(), petBrain, nextTick);
        runActingAgent(state.getExplorer(), explorerBrain, nextTick);

        // --- Council agents: evaluate and update council (no movement) ---
        runCouncilAgent(state.getDoctor(), doctorBrain, nextTick);
        runCouncilAgent(state.getPsychologist(), psychologistBrain, nextTick);
        runCouncilAgent(state.getJudge(), judgeBrain, nextTick);
    }

    private void runActingAgent(Agent agent, AgentBrain brain, long tick) {
        if (agent == null) return;
        AgentDecision decision = brain.decide(state, agent);
        agent.setCurrentThought(decision.getNewThought());
        agent.remember(decision.getNewThought());
        applyMovement(agent, decision);
        state.addEvent(new WorldEvent(tick, decision.getWorldEventDescription()));
    }

    /** Council agents observe and update council data; they do not move. */
    private void runCouncilAgent(Agent agent, AgentBrain brain, long tick) {
        if (agent == null) return;
        AgentDecision decision = brain.decide(state, agent);
        agent.setCurrentThought(decision.getNewThought());
        agent.remember(decision.getNewThought());
        // No applyMovement: council agents do not move on the grid
        state.addEvent(new WorldEvent(tick, decision.getWorldEventDescription()));
    }
}

