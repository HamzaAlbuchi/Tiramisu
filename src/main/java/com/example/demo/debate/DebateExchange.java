package com.example.demo.debate;

/**
 * One turn in a debate: which model spoke and what they said.
 * Replace {@link #getText()} generation with LLM calls when wiring real models.
 */
public class DebateExchange {

    private final String speaker;
    private final String text;

    public DebateExchange(String speaker, String text) {
        this.speaker = speaker;
        this.text = text;
    }

    public String getSpeaker() {
        return speaker;
    }

    public String getText() {
        return text;
    }
}
