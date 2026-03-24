package com.example.demo.world;

public interface AgentBrain {

    /**
     * Decide what the agent thinks and how it is reported to the world
     * for the current world state.
     */
    AgentDecision decide(WorldState world, Agent agent);
}

