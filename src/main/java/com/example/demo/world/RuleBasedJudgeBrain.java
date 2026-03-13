package com.example.demo.world;

import java.util.ArrayList;
import java.util.List;

/**
 * Council agent (Judge): detects rule violations / conflicts (e.g. two acting
 * agents occupying the same cell). Writes to Council conflict log; does not move.
 */
public class RuleBasedJudgeBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        Council council = world.getCouncil();
        long tick = world.getTick();

        // Only acting agents can conflict on the grid; council members do not move
        List<Agent> acting = collectActingAgents(world);
        List<String> conflictsThisTick = new ArrayList<>();

        for (int i = 0; i < acting.size(); i++) {
            Agent a = acting.get(i);
            int ax = a.getPositionX();
            int ay = a.getPositionY();
            for (int j = i + 1; j < acting.size(); j++) {
                Agent b = acting.get(j);
                if (b.getPositionX() == ax && b.getPositionY() == ay) {
                    String entry = String.format("Tick %d: Conflict — %s and %s at same location (%d, %d).",
                            tick, a.getName(), b.getName(), ax, ay);
                    council.addConflict(entry);
                    conflictsThisTick.add(a.getName() + " vs " + b.getName() + " at (" + ax + "," + ay + ")");
                }
            }
        }

        String thought = conflictsThisTick.isEmpty()
                ? "I observe the relations between beings on this island, ready to weigh in when conflict arises."
                : "I have recorded " + conflictsThisTick.size() + " conflict(s) this tick. The parties must be noted.";
        String event = conflictsThisTick.isEmpty()
                ? "Judicial Report: Island relations remain peaceful; no conflicts detected."
                : "Judicial Report: Conflict(s) recorded: " + String.join("; ", conflictsThisTick);

        return new AgentDecision(thought, event);
    }

    private List<Agent> collectActingAgents(WorldState world) {
        List<Agent> list = new ArrayList<>();
        if (world.getPioneer() != null) list.add(world.getPioneer());
        if (world.getCompanion() != null) list.add(world.getCompanion());
        if (world.getExplorer() != null) list.add(world.getExplorer());
        return list;
    }
}

