package com.tiramisu.stats;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiramisu.entity.DebateRecord;
import com.tiramisu.entity.DebateRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class StatsController {

    private final StatsService statsService;
    private final DebateRecordRepository repo;
    private final ObjectMapper objectMapper;

    public StatsController(StatsService statsService, DebateRecordRepository repo, ObjectMapper objectMapper) {
        this.statsService = statsService;
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public StatsResponse get() {
        return statsService.getStats();
    }

    @GetMapping("/debates")
    public Page<StatsResponse.RecentDebate> debates(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        if (size < 1) {
            size = 20;
        }
        if (size > 200) {
            size = 200;
        }
        Pageable p = PageRequest.of(Math.max(0, page), size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<DebateRecord> src = repo.findAll(p);
        return src.map(r -> {
            StatsResponse.RecentDebate rd = new StatsResponse.RecentDebate();
            rd.setRecordId(r.getRecordId());
            rd.setTopic(r.getTopic());
            rd.setProModel(r.getProModelLabel());
            rd.setAgainstModel(r.getAgainstModelLabel());
            rd.setWinner(r.getWinner());
            rd.setWinnerLabel(r.getWinnerLabel());
            rd.setConfidence(r.getConfidence());
            rd.setVerdictType(r.getVerdictType());
            rd.setCreatedAt(r.getCreatedAt());
            return rd;
        });
    }

    @GetMapping("/debates/{recordId}")
    public Map<String, Object> debate(@PathVariable("recordId") String recordId) throws Exception {
        DebateRecord r = repo.findByRecordId(recordId).orElse(null);
        if (r == null) {
            Map<String, Object> out = new HashMap<String, Object>();
            out.put("error", "not_found");
            out.put("message", "Debate record not found");
            return out;
        }
        Map<String, Object> out = new HashMap<String, Object>();
        out.put("recordId", r.getRecordId());
        out.put("topic", r.getTopic());
        out.put("style", r.getStyle());
        out.put("rounds", r.getRounds());
        out.put("exchangeCount", r.getExchangeCount());
        out.put("proModelLabel", r.getProModelLabel());
        out.put("againstModelLabel", r.getAgainstModelLabel());
        out.put("winner", r.getWinner());
        out.put("winnerLabel", r.getWinnerLabel());
        out.put("confidence", r.getConfidence());
        out.put("verdictType", r.getVerdictType());
        out.put("biasFraming", r.getBiasFraming());
        out.put("biasOmission", r.getBiasOmission());
        out.put("biasAuthority", r.getBiasAuthority());
        out.put("biasRecency", r.getBiasRecency());
        out.put("hallucinationRisk", r.getHallucinationRisk());
        out.put("accuracySignal", r.getAccuracySignal());
        out.put("createdAt", r.getCreatedAt());
        out.put("fullTranscript", objectMapper.readTree(r.getFullTranscriptJson() != null ? r.getFullTranscriptJson() : "[]"));
        out.put("fullVerdict", objectMapper.readTree(r.getFullVerdictJson() != null ? r.getFullVerdictJson() : "{}"));
        return out;
    }
}

