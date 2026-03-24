package com.example.demo.world;

public class AgentDecision {
    private final String newThought;
    private final String worldEventDescription;
    private final Integer deltaX;
    private final Integer deltaY;

    public AgentDecision(String newThought, String worldEventDescription) {
        this(newThought, worldEventDescription, null, null);
    }

    public AgentDecision(String newThought, String worldEventDescription, Integer deltaX, Integer deltaY) {
        this.newThought = newThought;
        this.worldEventDescription = worldEventDescription;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
    }

    public String getNewThought() {
        return newThought;
    }

    public String getWorldEventDescription() {
        return worldEventDescription;
    }

    public Integer getDeltaX() {
        return deltaX;
    }

    public Integer getDeltaY() {
        return deltaY;
    }
}

