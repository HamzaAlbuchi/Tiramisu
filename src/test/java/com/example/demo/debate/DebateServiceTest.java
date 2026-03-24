package com.example.demo.debate;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DebateServiceTest {

    private final DebateService service = new DebateService();

    @Test
    void runDebateReturnsExchangesVerdictAndBreakdown() {
        DebateResult r = service.runDebate("climate policy", 4);
        assertEquals(4, r.getExchangeCount());
        assertEquals(4, r.getExchanges().size());
        assertEquals(DebateService.DEFAULT_MODEL_A, r.getExchanges().get(0).getModelName());
        assertEquals(DebateService.DEFAULT_MODEL_B, r.getExchanges().get(1).getModelName());
        assertEquals("A", r.getExchanges().get(0).getSide());
        assertEquals("Pro", r.getExchanges().get(0).getRole());
        DebateVerdict v = r.getVerdict();
        assertNotNull(v.getSummary());
        assertFalse(v.getHallucinationBias().isEmpty());
        assertFalse(v.getAccuracyAssessment().isEmpty());
        assertNotNull(v.getWinnerKey());
        assertNotNull(v.getVerdictType());
        assertTrue(v.getConfidence() >= 0 && v.getConfidence() <= 1);
        assertNotNull(v.getJudgeAnalysis());
        assertNotNull(r.getEvaluationBreakdown());
        assertNotNull(r.getEvaluationBreakdown().getModelA());
    }

    @Test
    void emptyTopicGetsPlaceholder() {
        DebateResult r = service.runDebate("  ", 2);
        assertNotNull(r.getTopic());
    }
}
