package com.example.demo.debate.api;

/** First SSE event before transcript chunks — lets the UI show layout and expected turn count. */
public class DebateStreamMetaDto {

    private final String topic;
    private final String style;
    private final int rounds;
    private final int exchangeCount;
    private final DebateModelsDto models;

    public DebateStreamMetaDto(
            String topic,
            String style,
            int rounds,
            int exchangeCount,
            DebateModelsDto models) {
        this.topic = topic;
        this.style = style;
        this.rounds = rounds;
        this.exchangeCount = exchangeCount;
        this.models = models;
    }

    public String getTopic() {
        return topic;
    }

    public String getStyle() {
        return style;
    }

    public int getRounds() {
        return rounds;
    }

    public int getExchangeCount() {
        return exchangeCount;
    }

    public DebateModelsDto getModels() {
        return models;
    }
}
