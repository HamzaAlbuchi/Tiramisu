package com.tiramisu.debater;

import com.tiramisu.model.DebateTurn;
import com.tiramisu.provider.GeminiClient;
import com.tiramisu.provider.GeminiMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

// TODO: Add persona injection per model provider to create more diverse argument styles
// TODO: Cap history length to last N turns to manage token costs at scale
// TODO: Add style modifier (formal/casual/technical) to round context prompts

/**
 * Generates one side of a debate turn via Gemini using full transcript context.
 * Call {@link #beginDebateSession(int)} before a run (from the orchestrator) so round prompts
 * can distinguish middle vs closing rounds.
 */
@Service
public class DebaterService {

    private static final double TEMP_PRO = 0.9;
    private static final double TEMP_AGAINST = 0.4;

    private final GeminiClient geminiClient;

    /** Scheduled round count for the in-progress debate (set by orchestrator). */
    private volatile int scheduledRounds = 1;

    public DebaterService(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * Must be called once before generating turns for a debate (same thread / serialized orchestration).
     */
    public synchronized void beginDebateSession(int totalRounds) {
        this.scheduledRounds = totalRounds < 1 ? 1 : totalRounds;
    }

    public synchronized void endDebateSession() {
        this.scheduledRounds = 1;
    }

    public String generateTurn(
            String topic,
            String role,
            int round,
            List<DebateTurn> fullHistory) {
        int totalRounds = scheduledRounds;
        String systemPrompt;
        double temperature;
        if ("pro".equalsIgnoreCase(role)) {
            systemPrompt = buildProSystemPrompt(topic);
            temperature = TEMP_PRO;
        } else if ("against".equalsIgnoreCase(role)) {
            systemPrompt = buildAgainstSystemPrompt(topic);
            temperature = TEMP_AGAINST;
        } else {
            systemPrompt = buildProSystemPrompt(topic);
            temperature = TEMP_PRO;
        }

        List<GeminiMessage> history = buildHistory(topic, role, round, totalRounds, fullHistory);
        return geminiClient.completeWithHistory(systemPrompt, history, temperature);
    }

    private List<GeminiMessage> buildHistory(
            String topic,
            String perspectiveRole,
            int currentRound,
            int totalRounds,
            List<DebateTurn> fullHistory) {
        List<GeminiMessage> messages = new ArrayList<GeminiMessage>();

        if ("pro".equalsIgnoreCase(perspectiveRole)) {
            for (int k = 1; k < currentRound; k++) {
                DebateTurn proK = getProTurn(fullHistory, k);
                if (k == 1) {
                    messages.add(new GeminiMessage("user", proOpeningUserPrompt(topic)));
                    messages.add(new GeminiMessage("model", contentOrEmpty(proK)));
                } else {
                    DebateTurn againstPrev = getAgainstTurn(fullHistory, k - 1);
                    String opp = contentOrEmpty(againstPrev);
                    messages.add(new GeminiMessage("user", userPromptForProRound(k, totalRounds, opp)));
                    messages.add(new GeminiMessage("model", contentOrEmpty(proK)));
                }
            }
            if (currentRound == 1) {
                messages.add(new GeminiMessage("user", proOpeningUserPrompt(topic)));
            } else {
                DebateTurn lastAgainst = getAgainstTurn(fullHistory, currentRound - 1);
                String opp = contentOrEmpty(lastAgainst);
                messages.add(new GeminiMessage("user", userPromptForProRound(currentRound, totalRounds, opp)));
            }
        } else {
            for (int k = 1; k < currentRound; k++) {
                DebateTurn proK = getProTurn(fullHistory, k);
                DebateTurn againstK = getAgainstTurn(fullHistory, k);
                String proText = contentOrEmpty(proK);
                messages.add(new GeminiMessage("user", userPromptForAgainstRound(k, totalRounds, proText)));
                messages.add(new GeminiMessage("model", contentOrEmpty(againstK)));
            }
            DebateTurn proCurrent = getProTurn(fullHistory, currentRound);
            messages.add(new GeminiMessage(
                    "user",
                    userPromptForAgainstRound(currentRound, totalRounds, contentOrEmpty(proCurrent))));
        }

        return messages;
    }

    private static String contentOrEmpty(DebateTurn t) {
        if (t == null || t.getContent() == null) {
            return "";
        }
        return t.getContent();
    }

    private static DebateTurn getProTurn(List<DebateTurn> fullHistory, int roundOneBased) {
        int idx = 2 * (roundOneBased - 1);
        if (fullHistory == null || idx < 0 || idx >= fullHistory.size()) {
            return null;
        }
        return fullHistory.get(idx);
    }

    private static DebateTurn getAgainstTurn(List<DebateTurn> fullHistory, int roundOneBased) {
        int idx = 2 * (roundOneBased - 1) + 1;
        if (fullHistory == null || idx < 0 || idx >= fullHistory.size()) {
            return null;
        }
        return fullHistory.get(idx);
    }

    private static String proOpeningUserPrompt(String topic) {
        return "Make your opening argument for the motion: " + topic + "\n"
                + "Be direct and lead with your strongest claim.";
    }

    private static String middleUserPrompt(String lastOpponentTurn) {
        return "Your opponent just argued: " + lastOpponentTurn + "\n"
                + "Directly challenge their weakest point first,\n"
                + "then advance a new argument.";
    }

    private static String closingUserPrompt(String lastOpponentTurn) {
        return "Your opponent just argued: " + lastOpponentTurn + "\n"
                + "This is your closing argument — summarize your strongest points and expose the fatal "
                + "flaw in the opponent's case. Be decisive.";
    }

    private static String userPromptForProRound(int round, int totalRounds, String lastOpponentTurn) {
        if (round >= totalRounds) {
            return closingUserPrompt(lastOpponentTurn);
        }
        return middleUserPrompt(lastOpponentTurn);
    }

    private static String userPromptForAgainstRound(int round, int totalRounds, String lastOpponentTurn) {
        if (round >= totalRounds) {
            return closingUserPrompt(lastOpponentTurn);
        }
        return middleUserPrompt(lastOpponentTurn);
    }

    private static String buildProSystemPrompt(String topic) {
        return "You are a sharp, direct debater arguing FOR this motion: " + topic + "\n"
                + "Rules:\n"
                + "- Never restate the topic as a prefix\n"
                + "- Open with your strongest claim immediately\n"
                + "- Use concrete examples or data where possible\n"
                + "- After round 1, address the opponent's last argument before making new points\n"
                + "- Be aggressive but logical, never emotional\n"
                + "- Maximum 3 sentences. No bullet points.";
    }

    private static String buildAgainstSystemPrompt(String topic) {
        return "You are a precise, skeptical debater arguing AGAINST this motion: " + topic + "\n"
                + "Rules:\n"
                + "- Never restate the topic as a prefix\n"
                + "- Open by challenging the strongest assumption of the pro position\n"
                + "- Demand falsifiable evidence, not narrative\n"
                + "- After round 1, expose the weakest point in the opponent's last argument\n"
                + "- Be analytical and data-driven\n"
                + "- Maximum 3 sentences. No bullet points.";
    }
}
