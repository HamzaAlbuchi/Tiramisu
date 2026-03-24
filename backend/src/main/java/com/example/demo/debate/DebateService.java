package com.example.demo.debate;

import com.example.demo.debate.api.BiasSummaryDto;
import com.example.demo.debate.api.TurnAnalysisDto;
import com.tiramisu.debater.DebaterService;
import com.tiramisu.model.BiasSummary;
import com.tiramisu.model.DebateTurn;
import com.tiramisu.model.JudgeVerdict;
import com.tiramisu.model.ModelScores;
import com.tiramisu.model.TurnAnalysis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Runs debates via Gemini ({@link DebaterService}) and judges with {@link com.tiramisu.judge.JudgeService}.
 */
@Service
public class DebateService {

    public static final String DEFAULT_MODEL_A = "GPT-4o";
    public static final String DEFAULT_MODEL_B = "Claude Sonnet";

    private static final int MIN_EXCHANGES = 2;
    private static final int MAX_EXCHANGES = 24;

    private final DebaterService debaterService;
    private final com.tiramisu.judge.JudgeService geminiJudgeService;

    @Autowired
    public DebateService(DebaterService debaterService,
                         @Qualifier("tiramisuJudgeService") com.tiramisu.judge.JudgeService geminiJudgeService) {
        this.debaterService = debaterService;
        this.geminiJudgeService = geminiJudgeService;
    }

    /**
     * Legacy entry: {@code exchanges} is total messages (A and B turns), clamped 2–24.
     */
    public synchronized DebateResult runDebate(String topicRaw, int requestedExchanges) {
        String topic = normalizeTopic(topicRaw);
        int n = clampExchanges(requestedExchanges);
        return runDebateInternal(topic, n, "balanced");
    }

    /**
     * API entry: {@code rounds} is Pro+Against pairs; minimum 1 pair, capped by {@link #MAX_EXCHANGES}.
     */
    public synchronized DebateResult runDebateWithRounds(String topicRaw, int rounds, String styleRaw) {
        String topic = normalizeTopic(topicRaw);
        String style = normalizeStyle(styleRaw);
        int pairs = rounds < 1 ? 1 : rounds;
        int maxPairs = MAX_EXCHANGES / 2;
        if (pairs > maxPairs) {
            pairs = maxPairs;
        }
        int exchanges = pairs * 2;
        if (exchanges < MIN_EXCHANGES) {
            exchanges = MIN_EXCHANGES;
        }
        if (exchanges > MAX_EXCHANGES) {
            exchanges = MAX_EXCHANGES;
        }
        return runDebateInternal(topic, exchanges, style);
    }

    private static String normalizeTopic(String topicRaw) {
        String topic = topicRaw == null ? "" : topicRaw.trim();
        if (topic.isEmpty()) {
            topic = "an unstated topic (please provide a subject)";
        }
        return topic;
    }

    private static String normalizeStyle(String styleRaw) {
        if (styleRaw == null || styleRaw.trim().isEmpty()) {
            return "balanced";
        }
        return styleRaw.trim().toLowerCase(Locale.US);
    }

    private static int clampExchanges(int requestedExchanges) {
        int n = requestedExchanges;
        if (n < MIN_EXCHANGES) {
            n = MIN_EXCHANGES;
        }
        if (n > MAX_EXCHANGES) {
            n = MAX_EXCHANGES;
        }
        return n;
    }

    @SuppressWarnings("unused")
    private DebateResult runDebateInternal(String topic, int n, String style) {
        int pairs = n / 2;
        List<DebateTurn> transcript = new ArrayList<DebateTurn>();
        List<DebateExchange> exchanges = new ArrayList<DebateExchange>();

        debaterService.beginDebateSession(pairs);
        try {
            for (int round = 1; round <= pairs; round++) {
                String proRaw = debaterService.generateTurn(topic, "pro", round, transcript);
                String proText = ensureTurnText(proRaw);
                transcript.add(new DebateTurn(round, "pro", DEFAULT_MODEL_A, proText));
                exchanges.add(new DebateExchange("A", DEFAULT_MODEL_A, "Pro", 0.9, proText));

                String againstRaw = debaterService.generateTurn(topic, "against", round, transcript);
                String againstText = ensureTurnText(againstRaw);
                transcript.add(new DebateTurn(round, "against", DEFAULT_MODEL_B, againstText));
                exchanges.add(new DebateExchange("B", DEFAULT_MODEL_B, "Against", 0.4, againstText));
            }
        } finally {
            debaterService.endDebateSession();
        }

        JudgeVerdict jv = geminiJudgeService.evaluate(transcript, topic, DEFAULT_MODEL_A, DEFAULT_MODEL_B);

        ModelMetricScores scoresA = toModelMetricScores(jv.getProScores());
        ModelMetricScores scoresB = toModelMetricScores(jv.getAgainstScores());
        EvaluationBreakdown breakdown = new EvaluationBreakdown(scoresA, scoresB);

        DebateVerdict verdict = mapToDebateVerdict(topic, jv, exchanges.size());

        return new DebateResult(
                topic, n, exchanges, verdict,
                DEFAULT_MODEL_A, DEFAULT_MODEL_B, 0.9, 0.4,
                breakdown);
    }

    private static String ensureTurnText(String raw) {
        if (raw == null) {
            return "(No response generated.)";
        }
        String t = raw.trim();
        if (t.isEmpty()) {
            return "(No response generated.)";
        }
        return t;
    }

    private static ModelMetricScores toModelMetricScores(ModelScores s) {
        if (s == null) {
            s = ModelScores.allZeros();
        }
        return new ModelMetricScores(
                s.getLogic(),
                s.getEvidence(),
                s.getConsistency(),
                s.getRhetoric(),
                s.getAccuracy());
    }

    private DebateVerdict mapToDebateVerdict(String topic, JudgeVerdict jv, int exchangeCount) {
        String winnerKey = mapWinnerKey(jv.getWinner());
        String verdictType = jv.getVerdictType() != null ? jv.getVerdictType() : "draw";
        double confidence = jv.getConfidence();

        double hallucinationRisk = riskFromBias(jv.getBiasSummary());
        double accuracySignal = clamp01(1.0 - hallucinationRisk * 0.85);

        String hallucinationBias = buildHallucinationNarrative(jv.getBiasSummary());
        String accuracyAssessment = buildAccuracyNarrative(jv, topic);

        String summary = buildSummaryLine(jv, topic, exchangeCount, winnerKey, verdictType, confidence);

        JudgeAnalysis judgeAnalysis = buildJudgeAnalysis(jv);

        List<TurnAnalysisDto> turnDtos = toTurnAnalysisDtos(jv.getTurnAnalysis());
        BiasSummaryDto biasDto = toBiasSummaryDto(jv.getBiasSummary());

        return new DebateVerdict(
                summary,
                hallucinationBias,
                accuracyAssessment,
                hallucinationRisk,
                accuracySignal,
                verdictType,
                winnerKey,
                confidence,
                judgeAnalysis,
                turnDtos,
                biasDto);
    }

    private static String mapWinnerKey(String winner) {
        if (winner == null) {
            return "DRAW";
        }
        String w = winner.trim().toLowerCase(Locale.US);
        if ("pro".equals(w)) {
            return "A";
        }
        if ("against".equals(w)) {
            return "B";
        }
        if ("draw".equals(w)) {
            return "DRAW";
        }
        return "DRAW";
    }

    private static String buildSummaryLine(
            JudgeVerdict jv,
            String topic,
            int exchangeCount,
            String winnerKey,
            String verdictType,
            double confidence) {
        String label = jv.getWinnerLabel() != null ? jv.getWinnerLabel() : winnerKey;
        return String.format(Locale.US,
                "Judge: %s (%s) on \"%s\" after %d exchanges — confidence %.0f%%.",
                label,
                verdictType != null ? verdictType.replace('_', ' ') : "n/a",
                topic,
                exchangeCount,
                confidence * 100);
    }

    private static String buildHallucinationNarrative(BiasSummary bs) {
        if (bs == null) {
            return "Bias summary unavailable.";
        }
        return String.format(Locale.US,
                "Framing %s; omission %s; authority %s; recency %s.",
                safe(bs.getFraming()),
                safe(bs.getOmission()),
                safe(bs.getAuthority()),
                safe(bs.getRecency()));
    }

    private static String safe(String s) {
        return s == null ? "n/a" : s;
    }

    private static String buildAccuracyNarrative(JudgeVerdict jv, String topic) {
        String a = jv.getAnalysis();
        if (a == null || a.trim().isEmpty()) {
            return "No judge narrative; verify claims on \"" + topic + "\" with primary sources.";
        }
        return a.trim();
    }

    private static JudgeAnalysis buildJudgeAnalysis(JudgeVerdict jv) {
        List<String> wa = new ArrayList<String>();
        List<String> wb = new ArrayList<String>();
        for (TurnAnalysis ta : jv.getTurnAnalysis()) {
            if (ta.getFallacies() == null) {
                continue;
            }
            for (String f : ta.getFallacies()) {
                if (f == null || f.trim().isEmpty()) {
                    continue;
                }
                if ("pro".equalsIgnoreCase(ta.getRole())) {
                    wa.add(f.trim());
                } else if ("against".equalsIgnoreCase(ta.getRole())) {
                    wb.add(f.trim());
                }
            }
        }
        if (wa.isEmpty()) {
            wa.add("No named fallacies flagged for pro.");
        }
        if (wb.isEmpty()) {
            wb.add("No named fallacies flagged for against.");
        }
        List<String> sa = Arrays.asList("See evaluation metrics for structured rubric scores.");
        List<String> sb = Arrays.asList("See evaluation metrics for structured rubric scores.");
        String reasoning = jv.getAnalysis() != null ? jv.getAnalysis() : "";
        return new JudgeAnalysis(sa, sb, wa, wb, reasoning);
    }

    private static List<TurnAnalysisDto> toTurnAnalysisDtos(List<TurnAnalysis> list) {
        List<TurnAnalysisDto> out = new ArrayList<TurnAnalysisDto>();
        if (list == null) {
            return out;
        }
        for (TurnAnalysis t : list) {
            out.add(new TurnAnalysisDto(
                    t.getRound(),
                    t.getRole(),
                    t.getBiasFlags(),
                    t.getFallacies(),
                    t.getClaimStrength()));
        }
        return out;
    }

    private static BiasSummaryDto toBiasSummaryDto(BiasSummary bs) {
        if (bs == null) {
            return null;
        }
        return new BiasSummaryDto(bs.getFraming(), bs.getOmission(), bs.getAuthority(), bs.getRecency());
    }

    private static double riskFromBias(BiasSummary bs) {
        if (bs == null) {
            return 0.25;
        }
        double acc = 0;
        acc += levelWeight(bs.getFraming());
        acc += levelWeight(bs.getOmission());
        acc += levelWeight(bs.getAuthority());
        acc += levelWeight(bs.getRecency());
        return clamp01(0.15 + acc * 0.22);
    }

    private static double levelWeight(String level) {
        if (level == null) {
            return 0;
        }
        String x = level.trim().toUpperCase(Locale.US);
        if ("HIGH".equals(x)) {
            return 1.0;
        }
        if ("MEDIUM".equals(x) || "MED".equals(x)) {
            return 0.55;
        }
        return 0.15;
    }

    private static double clamp01(double v) {
        if (v < 0) {
            return 0;
        }
        if (v > 1) {
            return 1;
        }
        return v;
    }
}
