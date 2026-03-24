package com.example.demo.debate;

/**
 * Client payload for POST /api/debate/run.
 * topic: debate subject; exchanges: number of back-and-forth turns (A then B counts as 2 if both speak once).
 */
public class DebateRequest {

    private String topic = "";
    private int exchanges = 4;

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic != null ? topic : "";
    }

    public int getExchanges() {
        return exchanges;
    }

    public void setExchanges(int exchanges) {
        this.exchanges = exchanges;
    }
}
