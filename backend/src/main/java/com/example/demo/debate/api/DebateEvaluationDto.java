package com.example.demo.debate.api;

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
    /** CLEAR_WIN, SLIGHT_WIN, or DRAW */
    private final String verdictType;
    private final double hallucinationRiskScore;
    private final double accuracySignalScore;
    private final DebateMetricsDto metrics;
    private final DebateAnalysisDto analysis;

    public DebateEvaluationDto(String winner, String winnerLabel, double confidence, String verdictType,
                               double hallucinationRiskScore, double accuracySignalScore,
                               DebateMetricsDto metrics, DebateAnalysisDto analysis) {
        this.winner = winner;
        this.winnerLabel = winnerLabel;
        this.confidence = confidence;
        this.verdictType = verdictType;
        this.hallucinationRiskScore = hallucinationRiskScore;
        this.accuracySignalScore = accuracySignalScore;
        this.metrics = metrics;
        this.analysis = analysis;
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
}
