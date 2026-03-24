package com.tiramisu.integration;

import com.example.demo.debate.DebateExchange;
import com.example.demo.debate.DebateResult;
import com.example.demo.debate.DebateService;
import com.example.demo.debate.DebateVerdict;
import com.example.demo.debate.ModelMetricScores;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@EnabledIfEnvironmentVariable(named = "GEMINI_API_KEY", matches = ".+")
class GeminiIntegrationTest {

    @Autowired
    private DebateService debateService;

    @Test
    void twoRoundDebateUsesLiveGemini() {
        DebateResult r = debateService.runDebateWithRounds("Coffee is better than tea", 2, "balanced");
        assertEquals(4, r.getExchanges().size());

        for (DebateExchange ex : r.getExchanges()) {
            assertNotNull(ex.getText());
            assertFalse(ex.getText().trim().isEmpty());
            assertFalse(
                    ex.getText().matches("(?is).*Round\\s+\\d+\\s+[—\\-].*"),
                    "Turn should not use a 'Round X —' style prefix: " + ex.getText());
        }

        DebateVerdict v = r.getVerdict();
        assertNotNull(v);
        String wk = v.getWinnerKey();
        assertTrue("A".equals(wk) || "B".equals(wk) || "DRAW".equals(wk), "winnerKey=" + wk);

        double c = v.getConfidence();
        assertTrue(c >= 0.0 && c <= 1.0, "confidence=" + c);
        assertFalse("error".equalsIgnoreCase(v.getVerdictType()), "verdictType=" + v.getVerdictType());

        ModelMetricScores ma = r.getEvaluationBreakdown().getModelA();
        ModelMetricScores mb = r.getEvaluationBreakdown().getModelB();
        double sumA = ma.getLogicalConsistency() + ma.getArgumentStrength()
                + ma.getRebuttalQuality() + ma.getBiasNeutrality() + ma.getClarity();
        double sumB = mb.getLogicalConsistency() + mb.getArgumentStrength()
                + mb.getRebuttalQuality() + mb.getBiasNeutrality() + mb.getClarity();
        assertTrue(sumA > 0.0 || sumB > 0.0, "Expected at least one positive rubric score");
    }
}
