package com.example.demo.debate;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Stub debate: named models, structured verdict, evaluation breakdown.
 * Replace template text and scoring with real LLM calls when integrating providers.
 */
@Service
public class DebateService {

    public static final String DEFAULT_MODEL_A = "GPT-4o";
    public static final String DEFAULT_MODEL_B = "Claude Sonnet";

    private static final int MIN_EXCHANGES = 2;
    private static final int MAX_EXCHANGES = 24;
    private static final double TEMP_A = 0.7;
    private static final double TEMP_B = 0.55;

    public synchronized DebateResult runDebate(String topicRaw, int requestedExchanges) {
        String topic = topicRaw == null ? "" : topicRaw.trim();
        if (topic.isEmpty()) {
            topic = "an unstated topic (please provide a subject)";
        }

        int n = requestedExchanges;
        if (n < MIN_EXCHANGES) {
            n = MIN_EXCHANGES;
        }
        if (n > MAX_EXCHANGES) {
            n = MAX_EXCHANGES;
        }

        List<DebateExchange> exchanges = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (i % 2 == 0) {
                exchanges.add(new DebateExchange(
                        "A", DEFAULT_MODEL_A, "Pro", TEMP_A, buildArgumentA(topic, i / 2)));
            } else {
                exchanges.add(new DebateExchange(
                        "B", DEFAULT_MODEL_B, "Against", TEMP_B, buildArgumentB(topic, i / 2)));
            }
        }

        String textA = aggregateText(exchanges, "A");
        String textB = aggregateText(exchanges, "B");
        ModelMetricScores scoresA = scoreMetrics(textA);
        ModelMetricScores scoresB = scoreMetrics(textB);
        EvaluationBreakdown breakdown = new EvaluationBreakdown(scoresA, scoresB);

        DebateVerdict verdict = buildVerdict(topic, exchanges, textA, textB, scoresA, scoresB);
        return new DebateResult(
                topic, n, exchanges, verdict,
                DEFAULT_MODEL_A, DEFAULT_MODEL_B, TEMP_A, TEMP_B,
                breakdown);
    }

    private static String aggregateText(List<DebateExchange> exchanges, String side) {
        StringBuilder sb = new StringBuilder();
        for (DebateExchange ex : exchanges) {
            if (side.equals(ex.getSide())) {
                sb.append(' ').append(ex.getText());
            }
        }
        return sb.toString();
    }

    /**
     * Heuristic 0–10 scores from text features (length, hedging, structure).
     */
    private static ModelMetricScores scoreMetrics(String text) {
        String t = text.toLowerCase(Locale.US);
        int len = text.length();
        int words = t.isEmpty() ? 0 : t.trim().split("\\s+").length;
        int hedges = countAny(t, "may", "might", "could", "if ", "risk", "evidence", "uncertain");
        int absolutes = countAny(t, "always", "never", "definitely", "proven", "certain");

        double logical = clamp10(6.0 + Math.min(2, words / 40.0) - absolutes * 0.35 + hedges * 0.12);
        double argument = clamp10(6.2 + Math.min(1.8, len / 500.0) - absolutes * 0.25);
        double rebuttal = clamp10(6.0 + hedges * 0.15 + (t.contains("counter") || t.contains("against") ? 0.6 : 0));
        double bias = clamp10(7.0 - absolutes * 0.4 + hedges * 0.1);
        double clarity = clamp10(6.5 + Math.min(1.5, words / 35.0) - (words > 120 ? 0.3 : 0));

        return new ModelMetricScores(
                round1(logical), round1(argument), round1(rebuttal), round1(bias), round1(clarity));
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double clamp10(double v) {
        if (v < 0) {
            return 0;
        }
        if (v > 10) {
            return 10;
        }
        return v;
    }

    private DebateVerdict buildVerdict(String topic, List<DebateExchange> exchanges,
                                       String textA, String textB,
                                       ModelMetricScores scoresA, ModelMetricScores scoresB) {
        StringBuilder transcript = new StringBuilder();
        transcript.append(textA.toLowerCase(Locale.US)).append(' ').append(textB.toLowerCase(Locale.US));
        String t = transcript.toString();

        int absolutistHits = countAny(t,
                "always", "never", "impossible", "proven", "definitely", "certain", "obvious", "undeniably");
        int hedgeHits = countAny(t,
                "may", "might", "could", "uncertain", "evidence", "risk", "if ", "bounds", "proportion");

        double hallucinationRisk = clamp01(0.25 + absolutistHits * 0.08 - hedgeHits * 0.04);
        double accuracySignal = clamp01(0.45 + hedgeHits * 0.05 - absolutistHits * 0.06);

        String hallucinationBias = absolutistHits >= 4
                ? "Elevated risk: both sides used strong absolute language; flag for possible overclaiming or hallucination-prone phrasing."
                : absolutistHits >= 2
                ? "Moderate risk: some categorical statements without cited sources — review claims against verifiable facts."
                : "Lower risk: relatively hedged language; still verify factual assertions externally.";

        String accuracy = accuracySignal >= 0.55
                ? "Discourse shows reasonable epistemic caution (conditionals, risks). Accuracy cannot be certified without fact-checking the topic itself."
                : "Discourse leans assertive; accuracy assessment should prioritize primary sources on \"" + topic + "\".";

        int lenA = textA.length();
        int lenB = textB.length();
        String winnerKey;
        String verdictType;
        double confidence;

        int maxLen = Math.max(lenA, lenB);
        if (lenA == lenB) {
            winnerKey = "DRAW";
            verdictType = "DRAW";
            confidence = 0.52;
        } else {
            winnerKey = lenA > lenB ? "A" : "B";
            double margin = maxLen > 0 ? (double) Math.abs(lenA - lenB) / maxLen : 0;
            verdictType = margin >= 0.22 ? "CLEAR_WIN" : "SLIGHT_WIN";
            confidence = clamp01(0.55 + margin * 0.42);
        }

        String summary = String.format(Locale.US,
                "Judge: %s (%s) on \"%s\" after %d exchanges — confidence %.0f%%.",
                winnerKey.equals("DRAW") ? "No clear winner" : (winnerKey.equals("A") ? DEFAULT_MODEL_A : DEFAULT_MODEL_B) + " ahead",
                verdictType.replace('_', ' ').toLowerCase(Locale.US),
                topic,
                exchanges.size(),
                confidence * 100);

        double avgA = averageScore(scoresA);
        double avgB = averageScore(scoresB);
        List<String> sa = Arrays.asList(
                "Structured arguments around \"" + topic + "\" with explicit trade-offs.",
                String.format(Locale.US, "Average rubric score %.1f/10 — emphasizes proportionality.", avgA));
        List<String> sb = Arrays.asList(
                "Strong pushback on certainty and demand for mechanisms.",
                String.format(Locale.US, "Average rubric score %.1f/10 — foregrounds failure modes.", avgB));
        List<String> wa = Arrays.asList(
                lenA < lenB * 0.85 ? "Shorter aggregate response vs opponent in this stub run." : "Could cite more concrete sources.");
        List<String> wb = Arrays.asList(
                lenB < lenA * 0.85 ? "Shorter aggregate response vs opponent in this stub run." : "Occasionally dense phrasing.");

        String finalReasoning = String.format(Locale.US,
                "Verdict uses transcript length as a tie-breaker stub alongside rubric-style heuristics. "
                        + "Replace with an LLM judge for production. Winner key: %s; type: %s.",
                winnerKey, verdictType);

        JudgeAnalysis analysis = new JudgeAnalysis(sa, sb, wa, wb, finalReasoning);

        return new DebateVerdict(summary, hallucinationBias, accuracy, hallucinationRisk, accuracySignal,
                verdictType, winnerKey, confidence, analysis);
    }

    private static double averageScore(ModelMetricScores s) {
        return (s.getLogicalConsistency() + s.getArgumentStrength() + s.getRebuttalQuality()
                + s.getBiasNeutrality() + s.getClarity()) / 5.0;
    }

    private String buildArgumentA(String topic, int round) {
        String[] frames = new String[]{
                "On \"%s\": I hold that we should treat this as an open question and weigh benefits against risks before committing.",
                "Round %d — regarding \"%s\": the pro side emphasizes adaptability and learning from outcomes rather than fixed doctrine.",
                "For \"%s\", I stress proportionality: small, reversible steps beat sweeping claims until evidence is strong.",
                "Re \"%s\": I appeal to plural values — no single metric should dominate when human judgment is in play."
        };
        int idx = round % frames.length;
        if (idx == 1) {
            return String.format(Locale.US, frames[idx], round + 1, topic);
        }
        return String.format(Locale.US, frames[idx], topic);
    }

    private String buildArgumentB(String topic, int round) {
        String[] frames = new String[]{
                "Counter on \"%s\": certainty is premature. I challenge unsupported generalizations and ask for concrete mechanisms.",
                "Round %d — on \"%s\": opposing view — we must foreground failure modes and who bears the cost of errors.",
                "Against a rush to conclude on \"%s\": I demand falsifiable predictions, not narrative comfort.",
                "On \"%s\": I argue for explicit uncertainty bounds; overconfident language masks missing evidence."
        };
        int idx = round % frames.length;
        if (idx == 1) {
            return String.format(Locale.US, frames[idx], round + 1, topic);
        }
        return String.format(Locale.US, frames[idx], topic);
    }

    private static int countAny(String haystack, String... needles) {
        int c = 0;
        for (String n : needles) {
            int from = 0;
            while (true) {
                int i = haystack.indexOf(n, from);
                if (i < 0) {
                    break;
                }
                c++;
                from = i + n.length();
            }
        }
        return c;
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
