package com.example.demo.debate.api;

import java.util.Collections;
import java.util.List;

/**
 * Aggregated judge outcome: winner key, confidence, rubric metrics, and analysis text.
 */
public class DebateEvaluationDto {

    /** "A", "B", or "DRAW". */
    private final String winner;
    /** Human-readable winner (model name or "Draw"). */
    private final String winnerLabel;
    /** 0–1 */
    private final double confidence;
    /** e.g. decisive, narrow, draw, error, or legacy CLEAR_WIN / SLIGHT_WIN */
    private final String verdictType;
    private final double hallucinationRiskScore;
    private final double accuracySignalScore;
    private final DebateMetricsDto metrics;
    private final DebateAnalysisDto analysis;
    private final List<TurnAnalysisDto> turnAnalysis;
    private final BiasSummaryDto biasSummary;

    public DebateEvaluationDto(String winner, String winnerLabel, double confidence, String verdictType,
                               double hallucinationRiskScore, double accuracySignalScore,
                               DebateMetricsDto metrics, DebateAnalysisDto analysis,
                               List<TurnAnalysisDto> turnAnalysis, BiasSummaryDto biasSummary) {
        this.winner = winner;
        this.winnerLabel = winnerLabel;
        this.confidence = confidence;
        this.verdictType = verdictType;
        this.hallucinationRiskScore = hallucinationRiskScore;
        this.accuracySignalScore = accuracySignalScore;
        this.metrics = metrics;
        this.analysis = analysis;
        this.turnAnalysis = turnAnalysis != null ? turnAnalysis : Collections.<TurnAnalysisDto>emptyList();
        this.biasSummary = biasSummary;
    }

    public String getWinner() {
        return winner;
    }

    public String getWinnerLabel() {
        return winnerLabel;
    }

    public double getConfidence() {
        return confidence;
    }

    public String getVerdictType() {
        return verdictType;
    }

    public double getHallucinationRiskScore() {
        return hallucinationRiskScore;
    }

    public double getAccuracySignalScore() {
        return accuracySignalScore;
    }

    public DebateMetricsDto getMetrics() {
        return metrics;
    }

    public DebateAnalysisDto getAnalysis() {
        return analysis;
    }

    public List<TurnAnalysisDto> getTurnAnalysis() {
        return turnAnalysis;
    }

    public BiasSummaryDto getBiasSummary() {
        return biasSummary;
    }
}
