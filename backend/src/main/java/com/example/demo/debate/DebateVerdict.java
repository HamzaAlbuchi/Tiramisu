package com.example.demo.debate;

import com.example.demo.debate.api.BiasSummaryDto;
import com.example.demo.debate.api.TurnAnalysisDto;

import java.util.Collections;
import java.util.List;

/**
 * Judge output: legacy summary lines, risk/accuracy scores, verdict classification,
 * confidence, and structured analysis. Swap generation for real LLM judge output.
 */
public class DebateVerdict {

    private final String summary;
    private final String hallucinationBias;
    private final String accuracyAssessment;
    private final double hallucinationRiskScore;
    private final double accuracySignalScore;
    /** CLEAR_WIN, SLIGHT_WIN, or DRAW */
    private final String verdictType;
    /** A, B, or DRAW */
    private final String winnerKey;
    /** 0–1 */
    private final double confidence;
    private final JudgeAnalysis judgeAnalysis;
    private final List<TurnAnalysisDto> turnAnalysis;
    private final BiasSummaryDto biasSummary;

    public DebateVerdict(String summary, String hallucinationBias, String accuracyAssessment,
                         double hallucinationRiskScore, double accuracySignalScore,
                         String verdictType, String winnerKey, double confidence,
                         JudgeAnalysis judgeAnalysis,
                         List<TurnAnalysisDto> turnAnalysis, BiasSummaryDto biasSummary) {
        this.summary = summary;
        this.hallucinationBias = hallucinationBias;
        this.accuracyAssessment = accuracyAssessment;
        this.hallucinationRiskScore = hallucinationRiskScore;
        this.accuracySignalScore = accuracySignalScore;
        this.verdictType = verdictType;
        this.winnerKey = winnerKey;
        this.confidence = confidence;
        this.judgeAnalysis = judgeAnalysis;
        this.turnAnalysis = turnAnalysis != null ? turnAnalysis : Collections.<TurnAnalysisDto>emptyList();
        this.biasSummary = biasSummary;
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

    public String getVerdictType() {
        return verdictType;
    }

    public String getWinnerKey() {
        return winnerKey;
    }

    public double getConfidence() {
        return confidence;
    }

    public JudgeAnalysis getJudgeAnalysis() {
        return judgeAnalysis;
    }

    public List<TurnAnalysisDto> getTurnAnalysis() {
        return turnAnalysis;
    }

    public BiasSummaryDto getBiasSummary() {
        return biasSummary;
    }
}
