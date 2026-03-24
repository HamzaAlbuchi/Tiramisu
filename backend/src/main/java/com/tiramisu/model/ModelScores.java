package com.tiramisu.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Per-side rubric scores from the LLM judge (0–10).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ModelScores {

    private double accuracy;
    private double logic;
    private double evidence;
    private double consistency;
    private double rhetoric;

    public ModelScores() {
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }

    public double getLogic() {
        return logic;
    }

    public void setLogic(double logic) {
        this.logic = logic;
    }

    public double getEvidence() {
        return evidence;
    }

    public void setEvidence(double evidence) {
        this.evidence = evidence;
    }

    public double getConsistency() {
        return consistency;
    }

    public void setConsistency(double consistency) {
        this.consistency = consistency;
    }

    public double getRhetoric() {
        return rhetoric;
    }

    public void setRhetoric(double rhetoric) {
        this.rhetoric = rhetoric;
    }

    public static ModelScores allZeros() {
        ModelScores m = new ModelScores();
        m.setAccuracy(0);
        m.setLogic(0);
        m.setEvidence(0);
        m.setConsistency(0);
        m.setRhetoric(0);
        return m;
    }
}
