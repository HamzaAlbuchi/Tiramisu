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

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

/**
 * Runs debates via Gemini ({@link DebaterService}) and judges with {@link com.tiramisu.judge.JudgeService}.
 */
@Service
public class DebateService {

    public static final String DEFAULT_MODEL_A = "Gemini (Pro)";
    public static final String DEFAULT_MODEL_B = "Gemini (Against)";

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
        return runDebateInternal(topic, n, "balanced", n / 2, null, null, null);
    }

    /**
     * API entry: {@code rounds} is Pro+Against pairs; minimum 1 pair, capped by {@link #MAX_EXCHANGES}.
     */
    public synchronized DebateResult runDebateWithRounds(String topicRaw, int rounds, String styleRaw, CustomLlmConfig custom) {
        return runDebateWithRounds(topicRaw, rounds, styleRaw, custom, null, null, null);
    }

    public synchronized DebateResult runDebateWithRounds(
            String topicRaw,
            int rounds,
            String styleRaw,
            CustomLlmConfig custom,
            com.tiramisu.debater.TemperatureMode temperatureMode,
            Double proTemperature,
            Double againstTemperature) {
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
        return runDebateInternal(topic, exchanges, style, rounds, null, null, custom, temperatureMode, proTemperature, againstTemperature);
    }

    /**
     * Same as {@link #runDebateWithRounds} but invokes {@code onMeta} once before any LLM turn, then
     * {@code onTurn} after each pro/against message (index matches final transcript order).
     */
    public synchronized DebateResult runDebateWithRoundsStreaming(
            String topicRaw,
            int rounds,
            String styleRaw,
            Consumer<StreamingMeta> onMeta,
            BiConsumer<Integer, DebateExchange> onTurn,
            CustomLlmConfig custom) {
        return runDebateWithRoundsStreaming(topicRaw, rounds, styleRaw, onMeta, onTurn, custom, null, null, null);
    }

    public synchronized DebateResult runDebateWithRoundsStreaming(
            String topicRaw,
            int rounds,
            String styleRaw,
            Consumer<StreamingMeta> onMeta,
            BiConsumer<Integer, DebateExchange> onTurn,
            CustomLlmConfig custom,
            com.tiramisu.debater.TemperatureMode temperatureMode,
            Double proTemperature,
            Double againstTemperature) {
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
        return runDebateInternal(topic, exchanges, style, rounds, onMeta, onTurn, custom, temperatureMode, proTemperature, againstTemperature);
    }

    /** Metadata emitted once at the start of a streaming run. */
    public static final class StreamingMeta {

        private final String topic;
        private final String style;
        private final int requestedRounds;
        private final int exchangeCount;
        private final String modelA;
        private final String modelB;
        private final boolean custom;

        public StreamingMeta(
                String topic,
                String style,
                int requestedRounds,
                int exchangeCount,
                String modelA,
                String modelB,
                boolean custom) {
            this.topic = topic;
            this.style = style;
            this.requestedRounds = requestedRounds;
            this.exchangeCount = exchangeCount;
            this.modelA = modelA;
            this.modelB = modelB;
            this.custom = custom;
        }

        public String getTopic() {
            return topic;
        }

        public String getStyle() {
            return style;
        }

        public int getRequestedRounds() {
            return requestedRounds;
        }

        public int getExchangeCount() {
            return exchangeCount;
        }

        public String getModelA() {
            return modelA;
        }

        public String getModelB() {
            return modelB;
        }

        public boolean isCustom() {
            return custom;
        }
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

    private DebateResult runDebateInternal(
            String topic,
            int n,
            String style,
            int requestedRounds,
            Consumer<StreamingMeta> onMeta,
            BiConsumer<Integer, DebateExchange> onTurn,
            CustomLlmConfig custom,
            com.tiramisu.debater.TemperatureMode temperatureMode,
            Double proTemperature,
            Double againstTemperature) {
        int pairs = n / 2;
        List<DebateTurn> transcript = new ArrayList<DebateTurn>();
        List<DebateExchange> exchanges = new ArrayList<DebateExchange>();

        // Resolve temperatures once per run (default BALANCED).
        double[] temps = debaterService.resolveTemperatures(temperatureMode, proTemperature, againstTemperature);
        double proTempUsed = temps[0];
        double againstTempUsed = temps[1];

        boolean useCustom = custom != null;
        String modelA = DEFAULT_MODEL_A;
        String modelB = DEFAULT_MODEL_B;
        if (useCustom) {
            String base = deriveDisplayBase(custom);
            modelA = base + " (Pro)";
            modelB = base + " (Against)";
        }

        if (onMeta != null) {
            onMeta.accept(new StreamingMeta(topic, style, requestedRounds, n, modelA, modelB, useCustom));
        }

        debaterService.beginDebateSession(pairs);
        try {
            for (int round = 1; round <= pairs; round++) {
                String proRaw = generateTurnWithRetry(topic, "pro", round, transcript, custom, proTempUsed);
                String proText = ensureTurnText(proRaw);
                transcript.add(new DebateTurn(round, "pro", modelA, proText));
                exchanges.add(new DebateExchange("A", modelA, "Pro", proTempUsed, proText));
                notifyTurn(onTurn, exchanges);

                String againstRaw = generateTurnWithRetry(topic, "against", round, transcript, custom, againstTempUsed);
                String againstText = ensureTurnText(againstRaw);
                transcript.add(new DebateTurn(round, "against", modelB, againstText));
                exchanges.add(new DebateExchange("B", modelB, "Against", againstTempUsed, againstText));
                notifyTurn(onTurn, exchanges);
            }
        } finally {
            debaterService.endDebateSession();
        }

        JudgeVerdict jv = geminiJudgeService.evaluate(transcript, topic, modelA, modelB);

        ModelMetricScores scoresA = toModelMetricScores(jv.getProScores());
        ModelMetricScores scoresB = toModelMetricScores(jv.getAgainstScores());
        EvaluationBreakdown breakdown = new EvaluationBreakdown(scoresA, scoresB);

        DebateVerdict verdict = mapToDebateVerdict(topic, jv, exchanges.size());

        return new DebateResult(
                topic, n, exchanges, verdict,
                modelA, modelB, proTempUsed, againstTempUsed,
                breakdown,
                useCustom);
    }

    /**
     * Judge-only retry: re-run the judge on an existing transcript.
     * Does NOT re-generate debate turns.
     */
    public synchronized DebateResult judgeExistingTranscript(
            String topicRaw,
            String modelA,
            String modelB,
            boolean customModels,
            List<DebateExchange> exchanges,
            List<DebateTurn> transcript,
            double proTemperatureUsed,
            double againstTemperatureUsed) {
        String topic = normalizeTopic(topicRaw);
        JudgeVerdict jv = geminiJudgeService.evaluate(transcript, topic, modelA, modelB);

        ModelMetricScores scoresA = toModelMetricScores(jv.getProScores());
        ModelMetricScores scoresB = toModelMetricScores(jv.getAgainstScores());
        EvaluationBreakdown breakdown = new EvaluationBreakdown(scoresA, scoresB);

        DebateVerdict verdict = mapToDebateVerdict(topic, jv, exchanges != null ? exchanges.size() : 0);

        return new DebateResult(
                topic,
                exchanges != null ? exchanges.size() : 0,
                exchanges,
                verdict,
                modelA,
                modelB,
                proTemperatureUsed,
                againstTemperatureUsed,
                breakdown,
                customModels);
    }

    private static String deriveDisplayBase(CustomLlmConfig c) {
        if (c.getDisplayLabel() != null && !c.getDisplayLabel().trim().isEmpty()) {
            return c.getDisplayLabel().trim();
        }
        try {
            String raw = c.getEndpointUrl().trim();
            if (!raw.matches("(?i)^https?://")) {
                if (raw.startsWith("//")) {
                    raw = "https:" + raw;
                } else {
                    raw = "https://" + raw;
                }
            }
            int q = raw.indexOf('?');
            if (q >= 0) {
                raw = raw.substring(0, q);
            }
            URI uri = URI.create(raw);
            String host = uri.getHost();
            if (host != null && !host.isEmpty()) {
                return host;
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "Custom model";
    }

    private static void notifyTurn(BiConsumer<Integer, DebateExchange> onTurn, List<DebateExchange> exchanges) {
        if (onTurn == null) {
            return;
        }
        int idx = exchanges.size() - 1;
        onTurn.accept(idx, exchanges.get(idx));
    }

    private String generateTurnWithRetry(
            String topic, String role, int round, List<DebateTurn> transcript, CustomLlmConfig custom, double temperature) {
        String raw = debaterService.generateTurn(topic, role, round, transcript, custom, temperature);
        if (raw != null && !raw.trim().isEmpty()) {
            return raw;
        }
        // One retry to mitigate transient provider/network failures.
        return debaterService.generateTurn(topic, role, round, transcript, custom, temperature);
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
