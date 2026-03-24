package com.example.demo.debate;

/**
 * Judge output after the debate: qualitative verdict plus structured signals.
 * Hallucination / accuracy fields are heuristic in the stub; swap for model-based scoring with LLMs.
 */
public class DebateVerdict {

    private final String summary;
    private final String hallucinationBias;
    private final String accuracyAssessment;
    /** 0–1 heuristic: higher = more absolute / ungrounded phrasing detected in transcript. */
    private final double hallucinationRiskScore;
    /** 0–1 heuristic: higher = more balanced, evidence-style language. */
    private final double accuracySignalScore;

    public DebateVerdict(String summary, String hallucinationBias, String accuracyAssessment,
                         double hallucinationRiskScore, double accuracySignalScore) {
        this.summary = summary;
        this.hallucinationBias = hallucinationBias;
        this.accuracyAssessment = accuracyAssessment;
        this.hallucinationRiskScore = hallucinationRiskScore;
        this.accuracySignalScore = accuracySignalScore;
    }

    public String getSummary() {
        return summary;
    }

    public String getHallucinationBias() {
        return hallucinationBias;
    }

    public String getAccuracyAssessment() {
        return accuracyAssessment;
    }

    public double getHallucinationRiskScore() {
        return hallucinationRiskScore;
    }

    public double getAccuracySignalScore() {
        return accuracySignalScore;
    }
}
