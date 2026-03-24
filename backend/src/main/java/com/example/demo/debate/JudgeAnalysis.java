package com.example.demo.debate;

import java.util.Collections;
import java.util.List;

/** Structured judge narrative: strengths / weaknesses per side and closing reasoning. */
public class JudgeAnalysis {

    private final List<String> strengthsA;
    private final List<String> strengthsB;
    private final List<String> weaknessesA;
    private final List<String> weaknessesB;
    private final String finalReasoning;

    public JudgeAnalysis(List<String> strengthsA, List<String> strengthsB,
                         List<String> weaknessesA, List<String> weaknessesB,
                         String finalReasoning) {
        this.strengthsA = strengthsA != null ? strengthsA : Collections.emptyList();
        this.strengthsB = strengthsB != null ? strengthsB : Collections.emptyList();
        this.weaknessesA = weaknessesA != null ? weaknessesA : Collections.emptyList();
        this.weaknessesB = weaknessesB != null ? weaknessesB : Collections.emptyList();
        this.finalReasoning = finalReasoning != null ? finalReasoning : "";
    }

    public List<String> getStrengthsA() {
        return strengthsA;
    }

    public List<String> getStrengthsB() {
        return strengthsB;
    }

    public List<String> getWeaknessesA() {
        return weaknessesA;
    }

    public List<String> getWeaknessesB() {
        return weaknessesB;
    }

    public String getFinalReasoning() {
        return finalReasoning;
    }
}
