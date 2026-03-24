package com.example.demo.debate.api;

/** Side-by-side rubric scores for the evaluation panel. */
public class DebateMetricsDto {

    private final MetricPairDto logicalConsistency;
    private final MetricPairDto argumentStrength;
    private final MetricPairDto rebuttalQuality;
    private final MetricPairDto biasNeutrality;
    private final MetricPairDto clarity;

    public DebateMetricsDto(MetricPairDto logicalConsistency, MetricPairDto argumentStrength,
                            MetricPairDto rebuttalQuality, MetricPairDto biasNeutrality,
                            MetricPairDto clarity) {
        this.logicalConsistency = logicalConsistency;
        this.argumentStrength = argumentStrength;
        this.rebuttalQuality = rebuttalQuality;
        this.biasNeutrality = biasNeutrality;
        this.clarity = clarity;
    }

    public MetricPairDto getLogicalConsistency() {
        return logicalConsistency;
    }

    public MetricPairDto getArgumentStrength() {
        return argumentStrength;
    }

    public MetricPairDto getRebuttalQuality() {
        return rebuttalQuality;
    }

    public MetricPairDto getBiasNeutrality() {
        return biasNeutrality;
    }

    public MetricPairDto getClarity() {
        return clarity;
    }
}
