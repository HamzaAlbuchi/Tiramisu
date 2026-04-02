package com.example.demo.debate.api;

/**
 * JSON body for {@code POST /api/debate}.
 * {@code rounds} is the number of full Pro/Against pairs (each pair = two messages).
 */
public class DebateApiRequest {

    private String topic = "";
    /** Number of Pro+Against pairs; minimum 1. */
    private int rounds = 2;
    /** e.g. balanced, formal, casual, technical — affects stub phrasing only. */
    private String style = "balanced";

    /** Temperature selection mode. Default: BALANCED. */
    private com.tiramisu.debater.TemperatureMode temperatureMode = null;
    /** Used when temperatureMode=CUSTOM. */
    private Double proTemperature = null;
    /** Used when temperatureMode=CUSTOM. */
    private Double againstTemperature = null;

    /** When set, debate turns use this OpenAI-compatible chat-completions endpoint instead of Gemini. */
    private String customEndpointUrl = "";
    private String customApiKey = "";
    private String customModelId = "";
    /** Optional short label for transcripts (defaults to endpoint host). */
    private String customModelLabel = "";

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic != null ? topic : "";
    }

    public int getRounds() {
        return rounds;
    }

    public void setRounds(int rounds) {
        this.rounds = rounds;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style != null ? style : "balanced";
    }

    public com.tiramisu.debater.TemperatureMode getTemperatureMode() {
        return temperatureMode;
    }

    public void setTemperatureMode(com.tiramisu.debater.TemperatureMode temperatureMode) {
        this.temperatureMode = temperatureMode;
    }

    public Double getProTemperature() {
        return proTemperature;
    }

    public void setProTemperature(Double proTemperature) {
        this.proTemperature = proTemperature;
    }

    public Double getAgainstTemperature() {
        return againstTemperature;
    }

    public void setAgainstTemperature(Double againstTemperature) {
        this.againstTemperature = againstTemperature;
    }

    public String getCustomEndpointUrl() {
        return customEndpointUrl;
    }

    public void setCustomEndpointUrl(String customEndpointUrl) {
        this.customEndpointUrl = customEndpointUrl != null ? customEndpointUrl : "";
    }

    public String getCustomApiKey() {
        return customApiKey;
    }

    public void setCustomApiKey(String customApiKey) {
        this.customApiKey = customApiKey != null ? customApiKey : "";
    }

    public String getCustomModelId() {
        return customModelId;
    }

    public void setCustomModelId(String customModelId) {
        this.customModelId = customModelId != null ? customModelId : "";
    }

    public String getCustomModelLabel() {
        return customModelLabel;
    }

    public void setCustomModelLabel(String customModelLabel) {
        this.customModelLabel = customModelLabel != null ? customModelLabel : "";
    }
}
