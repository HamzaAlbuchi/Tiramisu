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
}
