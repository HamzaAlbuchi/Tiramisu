package com.example.demo.debate;

/**
 * One turn: model identity, role, optional sampling config, and message text.
 * {@link #getSpeaker()} mirrors {@link #getModelName()} for older clients.
 */
public class DebateExchange {

    private final String side;
    private final String modelName;
    private final String role;
    private final double temperature;
    private final String text;

    public DebateExchange(String side, String modelName, String role, double temperature, String text) {
        this.side = side;
        this.modelName = modelName;
        this.role = role;
        this.temperature = temperature;
        this.text = text;
    }

    /** "A" or "B" — use for layout and winner logic on the client. */
    public String getSide() {
        return side;
    }

    public String getModelName() {
        return modelName;
    }

    /** e.g. Pro / Against */
    public String getRole() {
        return role;
    }

    public double getTemperature() {
        return temperature;
    }

    public String getText() {
        return text;
    }

    /** Same as {@link #getModelName()} — kept for JSON clients expecting "speaker". */
    public String getSpeaker() {
        return modelName;
    }
}
