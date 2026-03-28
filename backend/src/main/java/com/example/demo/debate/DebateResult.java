package com.example.demo.debate;

import java.util.List;

/** Full debate run: identities, transcript, evaluation breakdown, and verdict. */
public class DebateResult {

    private final String topic;
    private final int exchangeCount;
    private final List<DebateExchange> exchanges;
    private final DebateVerdict verdict;
    private final String modelAName;
    private final String modelBName;
    private final double modelATemperature;
    private final double modelBTemperature;
    private final EvaluationBreakdown evaluationBreakdown;
    private final boolean customModels;

    public DebateResult(String topic, int exchangeCount, List<DebateExchange> exchanges, DebateVerdict verdict,
                        String modelAName, String modelBName,
                        double modelATemperature, double modelBTemperature,
                        EvaluationBreakdown evaluationBreakdown,
                        boolean customModels) {
        this.topic = topic;
        this.exchangeCount = exchangeCount;
        this.exchanges = exchanges;
        this.verdict = verdict;
        this.modelAName = modelAName;
        this.modelBName = modelBName;
        this.modelATemperature = modelATemperature;
        this.modelBTemperature = modelBTemperature;
        this.evaluationBreakdown = evaluationBreakdown;
        this.customModels = customModels;
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

    public String getModelAName() {
        return modelAName;
    }

    public String getModelBName() {
        return modelBName;
    }

    public double getModelATemperature() {
        return modelATemperature;
    }

    public double getModelBTemperature() {
        return modelBTemperature;
    }

    public EvaluationBreakdown getEvaluationBreakdown() {
        return evaluationBreakdown;
    }

    public boolean isCustomModels() {
        return customModels;
    }
}
