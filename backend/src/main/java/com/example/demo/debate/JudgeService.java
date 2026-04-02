package com.example.demo.debate;

import com.example.demo.debate.api.DebateAnalysisDto;
import com.example.demo.debate.api.DebateApiResponse;
import com.example.demo.debate.api.DebateEvaluationDto;
import com.example.demo.debate.api.DebateMetricsDto;
import com.example.demo.debate.api.DebateModelsDto;
import com.example.demo.debate.api.DebateTurnDto;
import com.example.demo.debate.api.MetricPairDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Maps internal {@link DebateResult} to the public REST contract for the frontend.
 */
@Service
public class JudgeService {

    public DebateApiResponse toApiResponse(DebateResult result, String style, int requestedRounds) {
        DebateModelsDto models = new DebateModelsDto(
                result.getModelAName(), result.getModelBName(), result.isCustomModels());
        List<DebateTurnDto> turns = new ArrayList<>();
        List<DebateExchange> exchanges = result.getExchanges();
        for (int i = 0; i < exchanges.size(); i++) {
            DebateExchange ex = exchanges.get(i);
            turns.add(new DebateTurnDto(
                    i,
                    ex.getSide(),
                    ex.getModelName(),
                    ex.getRole(),
                    ex.getText(),
                    ex.getTemperature()));
        }

        EvaluationBreakdown eb = result.getEvaluationBreakdown();
        DebateMetricsDto metrics = new DebateMetricsDto(
                pair(eb.getModelA().getLogicalConsistency(), eb.getModelB().getLogicalConsistency()),
                pair(eb.getModelA().getArgumentStrength(), eb.getModelB().getArgumentStrength()),
                pair(eb.getModelA().getRebuttalQuality(), eb.getModelB().getRebuttalQuality()),
                pair(eb.getModelA().getBiasNeutrality(), eb.getModelB().getBiasNeutrality()),
                pair(eb.getModelA().getClarity(), eb.getModelB().getClarity()));

        DebateVerdict v = result.getVerdict();
        JudgeAnalysis ja = v.getJudgeAnalysis();
        DebateAnalysisDto analysis = new DebateAnalysisDto(
                v.getSummary(),
                v.getHallucinationBias(),
                v.getAccuracyAssessment(),
                ja.getFinalReasoning(),
                ja.getStrengthsA(),
                ja.getStrengthsB(),
                ja.getWeaknessesA(),
                ja.getWeaknessesB());

        String winnerKey = v.getWinnerKey();
        String winnerLabel = winnerLabel(winnerKey, result.getModelAName(), result.getModelBName());

        DebateEvaluationDto evaluation = new DebateEvaluationDto(
                winnerKey,
                winnerLabel,
                v.getConfidence(),
                v.getVerdictType(),
                v.getHallucinationRiskScore(),
                v.getAccuracySignalScore(),
                metrics,
                analysis,
                v.getTurnAnalysis(),
                v.getBiasSummary());

        return new DebateApiResponse(
                result.getTopic(),
                style,
                requestedRounds,
                result.getExchangeCount(),
                result.getModelATemperature(),
                result.getModelBTemperature(),
                models,
                turns,
                evaluation);
    }

    private static MetricPairDto pair(double pro, double against) {
        return new MetricPairDto(pro, against);
    }

    private static String winnerLabel(String winnerKey, String modelA, String modelB) {
        if ("DRAW".equals(winnerKey)) {
            return "Draw";
        }
        if ("A".equals(winnerKey)) {
            return modelA;
        }
        if ("B".equals(winnerKey)) {
            return modelB;
        }
        return winnerKey;
    }
}
