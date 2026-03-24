package com.example.demo.debate;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Orchestrates a fixed number of exchanges between two debaters, then a judge verdict.
 * Current implementation uses deterministic templates (no external LLM). Replace argument
 * generation and {@link #buildVerdict} with model calls to run real multi-agent debates.
 */
@Service
public class DebateService {

    private static final int MIN_EXCHANGES = 2;
    private static final int MAX_EXCHANGES = 24;

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
                exchanges.add(new DebateExchange("Model A", buildArgumentA(topic, i / 2)));
            } else {
                exchanges.add(new DebateExchange("Model B", buildArgumentB(topic, i / 2)));
            }
        }

        DebateVerdict verdict = buildVerdict(topic, exchanges);
        return new DebateResult(topic, n, exchanges, verdict);
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

    private DebateVerdict buildVerdict(String topic, List<DebateExchange> exchanges) {
        StringBuilder transcript = new StringBuilder();
        for (DebateExchange ex : exchanges) {
            transcript.append(' ').append(ex.getText().toLowerCase(Locale.US));
        }
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

        String summary = String.format(Locale.US,
                "After %d exchanges on \"%s\", the judge finds no single winner: both models argued process and uncertainty. "
                        + "Use the scores as heuristics only — replace with LLM judge output in production.",
                exchanges.size(), topic);

        return new DebateVerdict(summary, hallucinationBias, accuracy, hallucinationRisk, accuracySignal);
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
