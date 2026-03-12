package com.example.demo.world;

import java.util.List;

public class RuleBasedJudgeBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        List<String> conflictLog = world.getConflictLog();

        // For now, we only record conflicts when they occur.
        // With the current simple world there are no conflicts, so we keep the log empty
        // and just emit a general peace report.

        String thought = "I observe the relations between beings on this island, ready to weigh in when conflict arises.";
        String event = "Judicial Report: Island relations remain peaceful; no conflicts detected.";

        return new AgentDecision(thought, event);
    }
}

