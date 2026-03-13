package com.example.demo.world;

import java.util.ArrayList;
import java.util.List;

public class RuleBasedJudgeBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        List<String> conflictLog = world.getConflictLog();
        long tick = world.getTick();

        List<Agent> agents = collectAgents(world);
        List<String> conflictsThisTick = new ArrayList<>();

        for (int i = 0; i < agents.size(); i++) {
            Agent a = agents.get(i);
            int ax = a.getPositionX();
            int ay = a.getPositionY();
            for (int j = i + 1; j < agents.size(); j++) {
                Agent b = agents.get(j);
                if (b.getPositionX() == ax && b.getPositionY() == ay) {
                    String entry = String.format("Tick %d: Conflict — %s and %s at same location (%d, %d).",
                            tick, a.getName(), b.getName(), ax, ay);
                    conflictLog.add(entry);
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

    private List<Agent> collectAgents(WorldState world) {
        List<Agent> list = new ArrayList<>();
        if (world.getPioneer() != null) list.add(world.getPioneer());
        if (world.getCompanion() != null) list.add(world.getCompanion());
        if (world.getExplorer() != null) list.add(world.getExplorer());
        if (world.getDoctor() != null) list.add(world.getDoctor());
        if (world.getPsychologist() != null) list.add(world.getPsychologist());
        if (world.getJudge() != null) list.add(world.getJudge());
        return list;
    }
}

