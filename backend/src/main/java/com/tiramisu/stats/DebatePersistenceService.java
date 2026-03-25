package com.tiramisu.stats;

import com.example.demo.debate.api.BiasSummaryDto;
import com.example.demo.debate.api.DebateApiResponse;
import com.example.demo.debate.api.DebateEvaluationDto;
import com.example.demo.debate.api.DebateMetricsDto;
import com.tiramisu.entity.DebateRecord;
import com.tiramisu.entity.DebateRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@ConditionalOnBean(DebateRecordRepository.class)
public class DebatePersistenceService {

    private static final Logger log = LoggerFactory.getLogger(DebatePersistenceService.class);
    /** When DB is unhealthy, back off briefly instead of disabling forever. */
    private static volatile long disabledUntilEpochMs = 0L;
    private static final long COOLDOWN_MS = 60_000L;

    private final DebateRecordRepository repo;
    private final ObjectMapper objectMapper;

    public DebatePersistenceService(DebateRecordRepository repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    /**
     * Best-effort persistence. Must never throw to callers.
     */
    public void persist(DebateApiResponse response) {
        if (response == null) {
            return;
        }
        long now = System.currentTimeMillis();
        if (now < disabledUntilEpochMs) {
            log.debug("Debate persistence in cooldown (untilEpochMs={}); skipping.", disabledUntilEpochMs);
            return;
        }
        try {
            DebateRecord r = map(response);
            repo.save(r);
            log.info("Debate persisted: {}", r.getRecordId());
        } catch (Exception e) {
            // If the DB is down (common during TLS misconfig), avoid blocking every debate request,
            // but do not disable permanently (DB may recover).
            disabledUntilEpochMs = now + COOLDOWN_MS;
            log.error("Debate persistence failed (non-fatal); backing off {}ms", COOLDOWN_MS, e);
        }
    }

    private DebateRecord map(DebateApiResponse response) throws Exception {
        DebateRecord r = new DebateRecord();
        r.setRecordId("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        r.setTopic(response.getTopic());
        r.setStyle(response.getStyle());
        r.setRounds(response.getRounds());
        r.setExchangeCount(response.getExchangeCount());
        if (response.getModels() != null) {
            r.setProModelLabel(response.getModels().getPro());
            r.setAgainstModelLabel(response.getModels().getAgainst());
        }

        DebateEvaluationDto ev = response.getEvaluation();
        if (ev != null) {
            r.setWinner(mapWinner(ev.getWinner()));
            r.setWinnerLabel(ev.getWinnerLabel());
            r.setConfidence(ev.getConfidence());
            r.setVerdictType(mapVerdictType(ev.getVerdictType()));
            r.setHallucinationRisk(ev.getHallucinationRiskScore());
            r.setAccuracySignal(ev.getAccuracySignalScore());

            DebateMetricsDto m = ev.getMetrics();
            if (m != null) {
                // The UI currently treats "clarity" as accuracy; keep consistent for analytics.
                r.setProAccuracy(m.getClarity().getPro());
                r.setProLogic(m.getLogicalConsistency().getPro());
                r.setProEvidence(m.getArgumentStrength().getPro());
                r.setProConsistency(m.getRebuttalQuality().getPro());
                r.setProRhetoric(m.getBiasNeutrality().getPro());

                r.setAgainstAccuracy(m.getClarity().getAgainst());
                r.setAgainstLogic(m.getLogicalConsistency().getAgainst());
                r.setAgainstEvidence(m.getArgumentStrength().getAgainst());
                r.setAgainstConsistency(m.getRebuttalQuality().getAgainst());
                r.setAgainstRhetoric(m.getBiasNeutrality().getAgainst());
            }

            BiasSummaryDto bs = ev.getBiasSummary();
            if (bs != null) {
                r.setBiasFraming(bs.getFraming());
                r.setBiasOmission(bs.getOmission());
                r.setBiasAuthority(bs.getAuthority());
                r.setBiasRecency(bs.getRecency());
            }
        }

        r.setFullTranscriptJson(objectMapper.writeValueAsString(response.getTurns()));
        r.setFullVerdictJson(objectMapper.writeValueAsString(response.getEvaluation()));
        return r;
    }

    private static String mapWinner(String winnerKey) {
        if (winnerKey == null) {
            return "draw";
        }
        String w = winnerKey.trim().toUpperCase();
        if ("A".equals(w) || "PRO".equals(w)) {
            return "pro";
        }
        if ("B".equals(w) || "AGAINST".equals(w)) {
            return "against";
        }
        return "draw";
    }

    private static String mapVerdictType(String verdictType) {
        if (verdictType == null) {
            return "error";
        }
        String v = verdictType.trim().toUpperCase();
        if ("CLEAR_WIN".equals(v) || "DECISIVE".equals(v)) {
            return "decisive";
        }
        if ("SLIGHT_WIN".equals(v) || "NARROW".equals(v)) {
            return "narrow";
        }
        if ("DRAW".equals(v)) {
            return "draw";
        }
        return verdictType.trim().toLowerCase();
    }
}

