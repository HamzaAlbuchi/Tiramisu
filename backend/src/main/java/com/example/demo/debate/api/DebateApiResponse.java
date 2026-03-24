package com.example.demo.debate.api;

import java.util.List;

/** Public JSON shape for {@code POST /api/debate}. */
public class DebateApiResponse {

    private final String topic;
    private final String style;
    private final int rounds;
    private final int exchangeCount;
    private final DebateModelsDto models;
    private final List<DebateTurnDto> turns;
    private final DebateEvaluationDto evaluation;

    public DebateApiResponse(String topic, String style, int rounds, int exchangeCount,
                             DebateModelsDto models, List<DebateTurnDto> turns,
                             DebateEvaluationDto evaluation) {
        this.topic = topic;
        this.style = style;
        this.rounds = rounds;
        this.exchangeCount = exchangeCount;
        this.models = models;
        this.turns = turns;
        this.evaluation = evaluation;
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

    public List<DebateTurnDto> getTurns() {
        return turns;
    }

    public DebateEvaluationDto getEvaluation() {
        return evaluation;
    }
}
