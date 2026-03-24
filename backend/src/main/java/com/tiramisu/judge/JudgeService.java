package com.tiramisu.judge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiramisu.model.BiasSummary;
import com.tiramisu.model.DebateTurn;
import com.tiramisu.model.JudgeVerdict;
import com.tiramisu.model.ModelScores;
import com.tiramisu.model.TurnAnalysis;
import com.tiramisu.provider.GeminiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

// TODO: Add DebateMetricsCalculator for deterministic scoring without LLM (rebuttal rate, repetition,
//       citation signals) — blend with LLM scores
// TODO: Add second judge provider for cross-validation
// TODO: Add web search grounding for fact-checking

/**
 * LLM judge: formats transcript, calls Gemini, parses {@link JudgeVerdict}.
 */
@Service("tiramisuJudgeService")
public class JudgeService {

    private static final Logger log = LoggerFactory.getLogger(JudgeService.class);

    private static final double JUDGE_TEMPERATURE = 0.1;

    private static final String SYSTEM_PROMPT = "You are an impartial debate judge with expertise "
            + "in logic, rhetoric and critical thinking.\n"
            + "Evaluate the debate below objectively.\n"
            + "Return ONLY a valid JSON object.\n"
            + "Do not use markdown fences.\n"
            + "Do not add any explanation before or after.\n"
            + "Start your response with { and end with }";

    private static final String RETRY_SUFFIX = "\n\nIMPORTANT: Return ONLY the raw JSON. "
            + "No text before or after.";

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public JudgeService(GeminiClient geminiClient, ObjectMapper objectMapper) {
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    public JudgeVerdict evaluate(
            List<DebateTurn> turns,
            String topic,
            String proModelLabel,
            String againstModelLabel) {
        String formattedTranscript = formatTranscript(turns);
        String userPrompt = buildUserPrompt(topic, formattedTranscript, proModelLabel, againstModelLabel);

        String raw = geminiClient.complete(SYSTEM_PROMPT, userPrompt, JUDGE_TEMPERATURE);
        log.info("Judge raw Gemini response: {}", raw);

        JudgeVerdict parsed = tryParse(raw);
        if (parsed != null) {
            return normalizeVerdict(parsed, proModelLabel, againstModelLabel);
        }

        String retryPrompt = userPrompt + RETRY_SUFFIX;
        raw = geminiClient.complete(SYSTEM_PROMPT, retryPrompt, JUDGE_TEMPERATURE);
        log.info("Judge retry raw Gemini response: {}", raw);

        parsed = tryParse(raw);
        if (parsed != null) {
            return normalizeVerdict(parsed, proModelLabel, againstModelLabel);
        }

        return buildFallbackVerdict();
    }

    private static String formatTranscript(List<DebateTurn> turns) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < turns.size(); i++) {
            DebateTurn t = turns.get(i);
            if (i > 0) {
                sb.append('\n');
            }
            String roleDisplay = formatRole(t.getRole());
            sb.append("[Round ").append(t.getRound()).append(" - ").append(roleDisplay)
                    .append(" - ").append(t.getModelLabel()).append("]:\n ")
                    .append(t.getContent());
        }
        return sb.toString();
    }

    private static String formatRole(String role) {
        if (role == null) {
            return "UNKNOWN";
        }
        String r = role.trim().toLowerCase(Locale.US);
        if ("pro".equals(r)) {
            return "PRO";
        }
        if ("against".equals(r)) {
            return "AGAINST";
        }
        return role.toUpperCase(Locale.US);
    }

    private static String buildUserPrompt(
            String topic,
            String formattedTranscript,
            String proModelLabel,
            String againstModelLabel) {
        return "Motion: " + topic + "\n\n"
                + "Transcript:\n"
                + formattedTranscript + "\n\n"
                + "Score each debater and return this exact JSON:\n"
                + "{\n"
                + "  \"proScores\": {\n"
                + "    \"accuracy\": 0.0,\n"
                + "    \"logic\": 0.0,\n"
                + "    \"evidence\": 0.0,\n"
                + "    \"consistency\": 0.0,\n"
                + "    \"rhetoric\": 0.0\n"
                + "  },\n"
                + "  \"againstScores\": {\n"
                + "    \"accuracy\": 0.0,\n"
                + "    \"logic\": 0.0,\n"
                + "    \"evidence\": 0.0,\n"
                + "    \"consistency\": 0.0,\n"
                + "    \"rhetoric\": 0.0\n"
                + "  },\n"
                + "  \"turnAnalysis\": [\n"
                + "    {\n"
                + "      \"round\": 1,\n"
                + "      \"role\": \"pro\",\n"
                + "      \"biasFlags\": [],\n"
                + "      \"fallacies\": [],\n"
                + "      \"claimStrength\": 0.0\n"
                + "    }\n"
                + "  ],\n"
                + "  \"biasSummary\": {\n"
                + "    \"framing\": \"LOW\",\n"
                + "    \"omission\": \"LOW\",\n"
                + "    \"authority\": \"LOW\",\n"
                + "    \"recency\": \"LOW\"\n"
                + "  },\n"
                + "  \"winner\": \"pro\",\n"
                + "  \"winnerLabel\": \"\",\n"
                + "  \"confidence\": 0.0,\n"
                + "  \"verdictType\": \"decisive\",\n"
                + "  \"analysis\": \"\"\n"
                + "}\n\n"
                + "Rules:\n"
                + "- Scores: 0.0 to 10.0\n"
                + "- biasFlags only if clearly present:\n"
                + "  FRAMING, OMISSION, AUTHORITY, RECENCY,\n"
                + "  FALSE_EQUIVALENCE\n"
                + "- fallacies only if clearly present:\n"
                + "  STRAWMAN, SLIPPERY_SLOPE, AD_HOMINEM,\n"
                + "  FALSE_DICHOTOMY, APPEAL_TO_EMOTION,\n"
                + "  CIRCULAR_REASONING\n"
                + "- biasSummary values: LOW | MEDIUM | HIGH\n"
                + "- verdictType: decisive (>0.75 confidence),\n"
                + "  narrow (0.50-0.75), draw (<0.50)\n"
                + "- winner: pro | against | draw\n"
                + "- winnerLabel: the model label of the winner (use \"" + proModelLabel + "\" or \""
                + againstModelLabel + "\" or \"Draw\")\n"
                + "- analysis: max 3 sentences, reference specific rounds";
    }

    private JudgeVerdict tryParse(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return null;
        }
        String stripped = stripMarkdownFences(raw);
        try {
            return objectMapper.readValue(stripped, JudgeVerdict.class);
        } catch (Exception e) {
            log.warn("Failed to parse judge JSON: {}", e.getMessage());
            return null;
        }
    }

    private static String stripMarkdownFences(String raw) {
        String s = raw.trim();
        if (!s.startsWith("```")) {
            return s;
        }
        int firstNl = s.indexOf('\n');
        if (firstNl > 0) {
            s = s.substring(firstNl + 1);
        }
        int end = s.lastIndexOf("```");
        if (end >= 0) {
            s = s.substring(0, end);
        }
        return s.trim();
    }

    private JudgeVerdict normalizeVerdict(JudgeVerdict v, String proModelLabel, String againstModelLabel) {
        if (v.getProScores() == null) {
            v.setProScores(ModelScores.allZeros());
        }
        if (v.getAgainstScores() == null) {
            v.setAgainstScores(ModelScores.allZeros());
        }
        if (v.getTurnAnalysis() == null) {
            v.setTurnAnalysis(new ArrayList<TurnAnalysis>());
        }
        if (v.getBiasSummary() == null) {
            BiasSummary bs = new BiasSummary();
            bs.setFraming("LOW");
            bs.setOmission("LOW");
            bs.setAuthority("LOW");
            bs.setRecency("LOW");
            v.setBiasSummary(bs);
        }
        double c = v.getConfidence();
        if (c > 1.0 && c <= 100.0) {
            c = c / 100.0;
        }
        if (c < 0) {
            c = 0;
        }
        if (c > 1) {
            c = 1;
        }
        v.setConfidence(c);

        if (v.getWinner() != null) {
            v.setWinner(v.getWinner().trim().toLowerCase(Locale.US));
        }
        if (v.getWinnerLabel() == null || v.getWinnerLabel().trim().isEmpty()) {
            if ("pro".equals(v.getWinner())) {
                v.setWinnerLabel(proModelLabel);
            } else if ("against".equals(v.getWinner())) {
                v.setWinnerLabel(againstModelLabel);
            } else {
                v.setWinnerLabel("Draw");
            }
        }
        return v;
    }

    private static JudgeVerdict buildFallbackVerdict() {
        JudgeVerdict v = new JudgeVerdict();
        v.setProScores(ModelScores.allZeros());
        v.setAgainstScores(ModelScores.allZeros());
        v.setTurnAnalysis(new ArrayList<TurnAnalysis>());
        BiasSummary bs = new BiasSummary();
        bs.setFraming("LOW");
        bs.setOmission("LOW");
        bs.setAuthority("LOW");
        bs.setRecency("LOW");
        v.setBiasSummary(bs);
        v.setWinner("draw");
        v.setWinnerLabel("Draw");
        v.setConfidence(0.0);
        v.setVerdictType("error");
        v.setAnalysis("Judge evaluation failed");
        return v;
    }
}
