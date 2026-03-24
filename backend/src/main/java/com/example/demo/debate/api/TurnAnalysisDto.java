package com.example.demo.debate.api;

import java.util.List;

/** Per-turn judge flags from the LLM evaluation. */
public class TurnAnalysisDto {

    private final int round;
    private final String role;
    private final List<String> biasFlags;
    private final List<String> fallacies;
    private final double claimStrength;

    public TurnAnalysisDto(int round, String role, List<String> biasFlags, List<String> fallacies,
                         double claimStrength) {
        this.round = round;
        this.role = role;
        this.biasFlags = biasFlags;
        this.fallacies = fallacies;
        this.claimStrength = claimStrength;
    }

    public int getRound() {
        return round;
    }

    public String getRole() {
        return role;
    }

    public List<String> getBiasFlags() {
        return biasFlags;
    }

    public List<String> getFallacies() {
        return fallacies;
    }

    public double getClaimStrength() {
        return claimStrength;
    }
}
