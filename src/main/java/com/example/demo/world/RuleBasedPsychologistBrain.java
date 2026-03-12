package com.example.demo.world;

import java.util.Map;

public class RuleBasedPsychologistBrain implements AgentBrain {

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        Map<String, String> notes = world.getBehaviourNotes();

        Agent pioneer = world.getPioneer();
        Agent companion = world.getCompanion();

        if (pioneer != null) {
            String pioneerNote = "Eos appears " + inferMoodFromThought(pioneer.getCurrentThought()) + ".";
            notes.put(pioneer.getId(), pioneerNote);
        }

        if (companion != null) {
            String petNote = "Bony shows " + inferEnergyFromThought(companion.getCurrentThought()) + " energy.";
            notes.put(companion.getId(), petNote);
        }

        String thought = "I study how each being copes with isolation, mapping out their mood and energy.";
        String event = "Behavioural Insight: Updated psychological notes for present agents.";

        return new AgentDecision(thought, event);
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

