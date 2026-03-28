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
