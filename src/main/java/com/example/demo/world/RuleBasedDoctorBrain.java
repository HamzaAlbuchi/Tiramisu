package com.example.demo.world;

import java.util.List;

/**
 * Council agent (Doctor): observes acting agents for reasoning anomalies and
 * hallucination-style indicators. Writes diagnostic notes to Council; does not move.
 */
public class RuleBasedDoctorBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        Council council = world.getCouncil();
        long tick = world.getTick();

        // Simple heuristic: look at acting agents' thoughts for "voices" or "no answer"
        int flaggedAgents = 0;
        for (Agent other : new Agent[]{world.getPioneer(), world.getCompanion(), world.getExplorer()}) {
            if (other == null) continue;
            String thought = other.getCurrentThought();
            if (thought == null) continue;
            String lower = thought.toLowerCase();
            if (lower.contains("voice") || lower.contains("answer returns")) {
                flaggedAgents++;
            }
        }

        String summary = flaggedAgents == 0
                ? "No hallucination patterns detected in current agent thoughts."
                : "Possible hallucination indicators observed in " + flaggedAgents + " agent(s).";

        // Only add a diagnostic when the summary changes (avoid repeating the same message every tick)
        if (isDiagnosticNew(council.getDiagnostics(), summary)) {
            council.addDiagnostic("Tick " + tick + ": " + summary);
        }

        String thought = "I quietly monitor the inner lives of the island's minds, updating diagnostics where needed.";
        String event = "Clinical Watch: " + summary;

        return new AgentDecision(thought, event);
    }

    /** True if there is no last diagnostic or the last one has a different summary (after "Tick N: "). */
    private boolean isDiagnosticNew(List<String> diagnostics, String summary) {
        if (diagnostics.isEmpty()) {
            return true;
        }
        String last = diagnostics.get(diagnostics.size() - 1);
        int colonSpace = last.indexOf(": ");
        String previousSummary = colonSpace >= 0 ? last.substring(colonSpace + 2) : last;
        return !summary.equals(previousSummary);
    }
}

