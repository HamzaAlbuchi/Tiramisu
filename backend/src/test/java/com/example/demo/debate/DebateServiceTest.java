package com.example.demo.debate;

import com.tiramisu.debater.DebaterService;
import com.tiramisu.judge.JudgeService;
import com.tiramisu.model.BiasSummary;
import com.tiramisu.model.JudgeVerdict;
import com.tiramisu.model.ModelScores;
import com.tiramisu.model.TurnAnalysis;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DebateServiceTest {

    @Mock
    private DebaterService debaterService;

    @Mock
    private JudgeService geminiJudgeService;

    private DebateService service;

    @BeforeEach
    void init() {
        service = new DebateService(debaterService, geminiJudgeService);
    }

    @Test
    void runDebateReturnsExchangesVerdictAndBreakdown() {
        when(debaterService.generateTurn(anyString(), eq("pro"), anyInt(), anyList()))
                .thenReturn("Pro argument text.");
        when(debaterService.generateTurn(anyString(), eq("against"), anyInt(), anyList()))
                .thenReturn("Against argument text.");
        when(geminiJudgeService.evaluate(anyList(), anyString(), anyString(), anyString()))
                .thenReturn(stubVerdict());

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
        when(debaterService.generateTurn(anyString(), eq("pro"), anyInt(), anyList()))
                .thenReturn("Pro.");
        when(debaterService.generateTurn(anyString(), eq("against"), anyInt(), anyList()))
                .thenReturn("Against.");
        when(geminiJudgeService.evaluate(anyList(), anyString(), anyString(), anyString()))
                .thenReturn(stubVerdict());

        DebateResult r = service.runDebate("  ", 2);
        assertNotNull(r.getTopic());
    }

    @Test
    void runDebateWithRoundsProducesPairs() {
        when(debaterService.generateTurn(anyString(), anyString(), anyInt(), anyList()))
                .thenReturn("Turn body.");
        when(geminiJudgeService.evaluate(anyList(), anyString(), anyString(), anyString()))
                .thenReturn(stubVerdict());

        DebateResult r = service.runDebateWithRounds("energy", 3, "technical");
        assertEquals(6, r.getExchangeCount());
        assertEquals(6, r.getExchanges().size());
    }

    private static JudgeVerdict stubVerdict() {
        JudgeVerdict jv = new JudgeVerdict();
        ModelScores ps = new ModelScores();
        ps.setAccuracy(7.0);
        ps.setLogic(7.0);
        ps.setEvidence(6.5);
        ps.setConsistency(6.0);
        ps.setRhetoric(6.5);
        ModelScores as = new ModelScores();
        as.setAccuracy(6.0);
        as.setLogic(6.5);
        as.setEvidence(7.0);
        as.setConsistency(6.5);
        as.setRhetoric(6.0);
        jv.setProScores(ps);
        jv.setAgainstScores(as);
        jv.setTurnAnalysis(new ArrayList<TurnAnalysis>());
        BiasSummary bs = new BiasSummary();
        bs.setFraming("LOW");
        bs.setOmission("LOW");
        bs.setAuthority("LOW");
        bs.setRecency("LOW");
        jv.setBiasSummary(bs);
        jv.setWinner("pro");
        jv.setWinnerLabel(DebateService.DEFAULT_MODEL_A);
        jv.setConfidence(0.72);
        jv.setVerdictType("narrow");
        jv.setAnalysis("Pro slightly stronger on consistency in this stub.");
        return jv;
    }
}
