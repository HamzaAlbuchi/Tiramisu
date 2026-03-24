package com.example.demo.debate.api;

/** One message in the public debate transcript. */
public class DebateTurnDto {

    private final int index;
    private final String side;
    private final String modelName;
    private final String role;
    private final String text;
    private final double temperature;

    public DebateTurnDto(int index, String side, String modelName, String role, String text, double temperature) {
        this.index = index;
        this.side = side;
        this.modelName = modelName;
        this.role = role;
        this.text = text;
        this.temperature = temperature;
    }

    public int getIndex() {
        return index;
    }

    public String getSide() {
        return side;
    }

    public String getModelName() {
        return modelName;
    }

    public String getRole() {
        return role;
    }

    public String getText() {
        return text;
    }

    public double getTemperature() {
        return temperature;
    }
}
