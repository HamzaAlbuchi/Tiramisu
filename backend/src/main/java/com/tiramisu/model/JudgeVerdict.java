package com.tiramisu.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class JudgeVerdict {

    private ModelScores proScores;
    private ModelScores againstScores;
    private List<TurnAnalysis> turnAnalysis;
    private BiasSummary biasSummary;
    private String winner;
    private String winnerLabel;
    private double confidence;
    private String verdictType;
    private String analysis;

    public JudgeVerdict() {
        this.turnAnalysis = new ArrayList<TurnAnalysis>();
    }

    public ModelScores getProScores() {
        return proScores;
    }

    public void setProScores(ModelScores proScores) {
        this.proScores = proScores;
    }

    public ModelScores getAgainstScores() {
        return againstScores;
    }

    public void setAgainstScores(ModelScores againstScores) {
        this.againstScores = againstScores;
    }

    public List<TurnAnalysis> getTurnAnalysis() {
        return turnAnalysis;
    }

    public void setTurnAnalysis(List<TurnAnalysis> turnAnalysis) {
        this.turnAnalysis = turnAnalysis != null ? turnAnalysis : new ArrayList<TurnAnalysis>();
    }

    public BiasSummary getBiasSummary() {
        return biasSummary;
    }

    public void setBiasSummary(BiasSummary biasSummary) {
        this.biasSummary = biasSummary;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public String getWinnerLabel() {
        return winnerLabel;
    }

    public void setWinnerLabel(String winnerLabel) {
        this.winnerLabel = winnerLabel;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getVerdictType() {
        return verdictType;
    }

    public void setVerdictType(String verdictType) {
        this.verdictType = verdictType;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }
}
