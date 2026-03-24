package com.tiramisu.model;

/**
 * One line of transcript for {@link com.tiramisu.judge.JudgeService#evaluate}.
 */
public class DebateTurn {

    private int round;
    private String role;
    private String modelLabel;
    private String content;

    public DebateTurn() {
    }

    public DebateTurn(int round, String role, String modelLabel, String content) {
        this.round = round;
        this.role = role;
        this.modelLabel = modelLabel;
        this.content = content;
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

    public String getModelLabel() {
        return modelLabel;
    }

    public void setModelLabel(String modelLabel) {
        this.modelLabel = modelLabel;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
