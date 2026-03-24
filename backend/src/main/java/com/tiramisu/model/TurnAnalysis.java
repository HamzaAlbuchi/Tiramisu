package com.tiramisu.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TurnAnalysis {

    private int round;
    private String role;
    private List<String> biasFlags;
    private List<String> fallacies;
    private double claimStrength;

    public TurnAnalysis() {
        this.biasFlags = new ArrayList<String>();
        this.fallacies = new ArrayList<String>();
    }

    public int getRound() {
        return round;
    }

    public void setRound(int round) {
        this.round = round;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getBiasFlags() {
        return biasFlags;
    }

    public void setBiasFlags(List<String> biasFlags) {
        this.biasFlags = biasFlags != null ? biasFlags : new ArrayList<String>();
    }

    public List<String> getFallacies() {
        return fallacies;
    }

    public void setFallacies(List<String> fallacies) {
        this.fallacies = fallacies != null ? fallacies : new ArrayList<String>();
    }

    public double getClaimStrength() {
        return claimStrength;
    }

    public void setClaimStrength(double claimStrength) {
        this.claimStrength = claimStrength;
    }
}
