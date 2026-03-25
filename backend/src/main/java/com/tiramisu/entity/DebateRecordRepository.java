package com.tiramisu.entity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DebateRecordRepository extends JpaRepository<DebateRecord, Long> {

    // Total debate count
    long countByCreatedAtAfter(LocalDateTime date);

    Optional<DebateRecord> findByRecordId(String recordId);

    // Win counts per model label (excluding draws)
    @Query("SELECT r.winnerLabel, COUNT(r) FROM DebateRecord r WHERE r.winner <> 'draw' GROUP BY r.winnerLabel")
    List<Object[]> countWinsByWinnerLabel();

    // Average scores per model label
    // Returns: modelLabel, avgAccuracy, avgLogic, avgEvidence, avgConsistency, avgRhetoric
    @Query("SELECT r.winnerLabel, " +
            "AVG(CASE WHEN r.winner='pro' THEN r.proAccuracy ELSE r.againstAccuracy END), " +
            "AVG(CASE WHEN r.winner='pro' THEN r.proLogic ELSE r.againstLogic END), " +
            "AVG(CASE WHEN r.winner='pro' THEN r.proEvidence ELSE r.againstEvidence END), " +
            "AVG(CASE WHEN r.winner='pro' THEN r.proConsistency ELSE r.againstConsistency END), " +
            "AVG(CASE WHEN r.winner='pro' THEN r.proRhetoric ELSE r.againstRhetoric END) " +
            "FROM DebateRecord r WHERE r.winner <> 'draw' GROUP BY r.winnerLabel")
    List<Object[]> avgScoresByModel();

    // Head to head: pro model vs against model
    @Query("SELECT r.proModelLabel, r.againstModelLabel, r.winner, COUNT(r) " +
            "FROM DebateRecord r GROUP BY r.proModelLabel, r.againstModelLabel, r.winner")
    List<Object[]> countByProModelLabelAndAgainstModelLabel();

    // Verdict type distribution
    @Query("SELECT r.verdictType, COUNT(r) FROM DebateRecord r GROUP BY r.verdictType")
    List<Object[]> countByVerdictType();

    // Bias frequency
    @Query("SELECT r.biasFraming, COUNT(r) FROM DebateRecord r GROUP BY r.biasFraming")
    List<Object[]> countByBiasFraming();

    @Query("SELECT r.biasAuthority, COUNT(r) FROM DebateRecord r GROUP BY r.biasAuthority")
    List<Object[]> countByBiasAuthority();

    @Query("SELECT r.biasOmission, COUNT(r) FROM DebateRecord r GROUP BY r.biasOmission")
    List<Object[]> countByBiasOmission();

    @Query("SELECT r.biasRecency, COUNT(r) FROM DebateRecord r GROUP BY r.biasRecency")
    List<Object[]> countByBiasRecency();

    // Recent debates for history page
    List<DebateRecord> findTop20ByOrderByCreatedAtDesc();

    Page<DebateRecord> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Topic-based stats
    @Query("SELECT r.topic, COUNT(r), AVG(r.confidence) FROM DebateRecord r GROUP BY r.topic ORDER BY COUNT(r) DESC")
    List<Object[]> topicStats();

    @Query("SELECT r.topic, r.winner, COUNT(r) FROM DebateRecord r GROUP BY r.topic, r.winner")
    List<Object[]> topicWinnerCounts();
}

