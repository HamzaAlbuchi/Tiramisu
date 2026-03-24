package com.example.demo.debate;

/** Side-by-side metric scores for the judge evaluation panel. */
public class EvaluationBreakdown {

    private final ModelMetricScores modelA;
    private final ModelMetricScores modelB;

    public EvaluationBreakdown(ModelMetricScores modelA, ModelMetricScores modelB) {
        this.modelA = modelA;
        this.modelB = modelB;
    }

    public ModelMetricScores getModelA() {
        return modelA;
    }

    public ModelMetricScores getModelB() {
        return modelB;
    }
}
