package com.example.demo.debate;

import java.util.List;

/** Full outcome of a completed debate run. */
public class DebateResult {

    private final String topic;
    private final int exchangeCount;
    private final List<DebateExchange> exchanges;
    private final DebateVerdict verdict;

    public DebateResult(String topic, int exchangeCount, List<DebateExchange> exchanges, DebateVerdict verdict) {
        this.topic = topic;
        this.exchangeCount = exchangeCount;
        this.exchanges = exchanges;
        this.verdict = verdict;
    }

    public String getTopic() {
        return topic;
    }

    public int getExchangeCount() {
        return exchangeCount;
    }

    public List<DebateExchange> getExchanges() {
        return exchanges;
    }

    public DebateVerdict getVerdict() {
        return verdict;
    }
}
