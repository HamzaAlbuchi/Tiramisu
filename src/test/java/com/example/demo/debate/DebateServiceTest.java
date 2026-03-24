package com.example.demo.debate;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DebateServiceTest {

    private final DebateService service = new DebateService();

    @Test
    void runDebateReturnsExchangesAndVerdict() {
        DebateResult r = service.runDebate("climate policy", 4);
        assertEquals(4, r.getExchangeCount());
        assertEquals(4, r.getExchanges().size());
        assertEquals("Model A", r.getExchanges().get(0).getSpeaker());
        assertEquals("Model B", r.getExchanges().get(1).getSpeaker());
        DebateVerdict v = r.getVerdict();
        assertNotNull(v.getSummary());
        assertFalse(v.getHallucinationBias().isEmpty());
        assertFalse(v.getAccuracyAssessment().isEmpty());
    }

    @Test
    void emptyTopicGetsPlaceholder() {
        DebateResult r = service.runDebate("  ", 2);
        assertNotNull(r.getTopic());
    }
}
