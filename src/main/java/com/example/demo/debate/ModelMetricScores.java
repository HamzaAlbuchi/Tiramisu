package com.example.demo.debate;

/**
 * Per-model scores on a 0–10 scale for the evaluation dashboard.
 * Stub values are derived heuristically in {@link DebateService}; replace with LLM judge output.
 */
public class ModelMetricScores {

    private final double logicalConsistency;
    private final double argumentStrength;
    private final double rebuttalQuality;
    private final double biasNeutrality;
    private final double clarity;

    public ModelMetricScores(double logicalConsistency, double argumentStrength, double rebuttalQuality,
                             double biasNeutrality, double clarity) {
        this.logicalConsistency = logicalConsistency;
        this.argumentStrength = argumentStrength;
        this.rebuttalQuality = rebuttalQuality;
        this.biasNeutrality = biasNeutrality;
        this.clarity = clarity;
    }

    public double getLogicalConsistency() {
        return logicalConsistency;
    }

    public double getArgumentStrength() {
        return argumentStrength;
    }

    public double getRebuttalQuality() {
        return rebuttalQuality;
    }

    public double getBiasNeutrality() {
        return biasNeutrality;
    }

    public double getClarity() {
        return clarity;
    }
}
