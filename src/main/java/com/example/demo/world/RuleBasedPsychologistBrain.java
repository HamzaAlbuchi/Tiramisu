package com.example.demo.world;

import java.util.Map;

/**
 * Council agent (Psychologist): tracks behaviour patterns of acting agents and
 * records behavioural notes. Writes to Council; does not move.
 */
public class RuleBasedPsychologistBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        Council council = world.getCouncil();
        Map<String, String> notes = council.getBehaviourNotes();

        Agent pioneer = world.getPioneer();
        Agent companion = world.getCompanion();
        Agent explorer = world.getExplorer();

        if (pioneer != null) {
            String pioneerNote = "Eos appears " + inferMoodFromThought(pioneer.getCurrentThought()) + ".";
            putIfDifferent(notes, pioneer.getId(), pioneerNote);
        }

        if (companion != null) {
            String petNote = "Bony shows " + inferEnergyFromThought(companion.getCurrentThought()) + " energy.";
            putIfDifferent(notes, companion.getId(), petNote);
        }

        if (explorer != null) {
            String explorerNote = "Nova appears " + inferMoodFromThought(explorer.getCurrentThought()) + ".";
            putIfDifferent(notes, explorer.getId(), explorerNote);
        }

        String thought = "I study how each being copes with isolation, mapping out their mood and energy.";
        String event = "Behavioural Insight: Updated psychological notes for present agents.";

        return new AgentDecision(thought, event);
    }

    /** Only update the map if the new note is different from the previous one. */
    private void putIfDifferent(Map<String, String> notes, String agentId, String newNote) {
        String previous = notes.get(agentId);
        if (previous == null || !previous.equals(newNote)) {
            notes.put(agentId, newNote);
        }
    }

    private String inferMoodFromThought(String thought) {
        if (thought == null) {
            return "emotionally unreadable";
        }
        String lower = thought.toLowerCase();
        if (lower.contains("lonely")) {
            return "signs of loneliness";
        }
        if (lower.contains("hopeful") || lower.contains("curious")) {
            return "curiosity and cautious hope";
        }
        if (lower.contains("restless")) {
            return "restlessness and agitation";
        }
        return "stable mood";
    }

    private String inferEnergyFromThought(String thought) {
        if (thought == null) {
            return "unclear";
        }
        String lower = thought.toLowerCase();
        if (lower.contains("chase") || lower.contains("run") || lower.contains("digging")) {
            return "high";
        }
        if (lower.contains("watching") || lower.contains("waves")) {
            return "calm";
        }
        return "moderate";
    }
}

