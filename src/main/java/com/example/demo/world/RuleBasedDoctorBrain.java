package com.example.demo.world;

import java.util.Map;

public class RuleBasedDoctorBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        Map<String, Integer> scores = world.getHallucinationScores();

        // Very simple heuristic: look at each agent's latest thought for "voices" or "no answer"
        int flaggedAgents = 0;
        for (Agent other : new Agent[]{world.getPioneer(), world.getCompanion(), world.getExplorer()}) {
            if (other == null) {
                continue;
            }
            String thought = other.getCurrentThought();
            if (thought == null) {
                continue;
            }
            String lower = thought.toLowerCase();
            if (lower.contains("voice") || lower.contains("answer returns")) {
                scores.put(other.getId(), scores.getOrDefault(other.getId(), 0) + 1);
                flaggedAgents++;
            }
        }

        StringBuilder summary = new StringBuilder();
        if (flaggedAgents == 0) {
            summary.append("No hallucination patterns detected in current agent thoughts.");
        } else {
            summary.append("Possible hallucination indicators observed in ").append(flaggedAgents).append(" agent(s).");
        }

        String thought = "I quietly monitor the inner lives of the island's minds, updating hallucination scores where needed.";
        String event = "Clinical Watch: " + summary;

        return new AgentDecision(thought, event);
    }
}

