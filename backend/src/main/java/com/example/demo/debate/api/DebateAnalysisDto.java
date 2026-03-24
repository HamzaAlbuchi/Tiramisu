package com.example.demo.debate.api;

import java.util.List;

/** Judge narrative strings for the client. */
public class DebateAnalysisDto {

    private final String summary;
    private final String hallucinationBias;
    private final String accuracyAssessment;
    private final String finalReasoning;
    private final List<String> strengthsPro;
    private final List<String> strengthsAgainst;
    private final List<String> weaknessesPro;
    private final List<String> weaknessesAgainst;

    public DebateAnalysisDto(String summary, String hallucinationBias, String accuracyAssessment,
                             String finalReasoning,
                             List<String> strengthsPro, List<String> strengthsAgainst,
                             List<String> weaknessesPro, List<String> weaknessesAgainst) {
        this.summary = summary;
        this.hallucinationBias = hallucinationBias;
        this.accuracyAssessment = accuracyAssessment;
        this.finalReasoning = finalReasoning;
        this.strengthsPro = strengthsPro;
        this.strengthsAgainst = strengthsAgainst;
        this.weaknessesPro = weaknessesPro;
        this.weaknessesAgainst = weaknessesAgainst;
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

    public String getFinalReasoning() {
        return finalReasoning;
    }

    public List<String> getStrengthsPro() {
        return strengthsPro;
    }

    public List<String> getStrengthsAgainst() {
        return strengthsAgainst;
    }

    public List<String> getWeaknessesPro() {
        return weaknessesPro;
    }

    public List<String> getWeaknessesAgainst() {
        return weaknessesAgainst;
    }
}
