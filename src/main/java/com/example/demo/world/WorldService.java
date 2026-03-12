package com.example.demo.world;

import org.springframework.stereotype.Service;

@Service
public class WorldService {

    private final WorldState state;

    public WorldService() {
        this.state = new WorldState();
        resetWorld();
    }

    public synchronized void resetWorld() {
        Agent pioneer = new Agent("Eos", AgentRole.FIRST_LIFE, "Island-1:shore");
        pioneer.setCurrentThought("I am awake, alone on this island. Is there any other life out here?");
        pioneer.remember("Awakening as the first life on Island-1.");

        state.setTick(0L);
        state.setPioneer(pioneer);
        state.addEvent(new WorldEvent(state.getTick(), "Breaking: The first lifeform 'Eos' awakens on Island-1."));
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

    private void advanceOneTick() {
        long nextTick = state.getTick() + 1;
        state.setTick(nextTick);

        Agent pioneer = state.getPioneer();
        if (pioneer == null) {
            return;
        }

        String thought = "Tick " + nextTick + ": I search the island for any sign of other life, but find only wind and waves.";
        pioneer.setCurrentThought(thought);
        pioneer.remember(thought);

        String eventDescription = "Eos scans the shoreline and the treeline, calling out for other life. No answer returns.";
        state.addEvent(new WorldEvent(nextTick, eventDescription));
    }
}

