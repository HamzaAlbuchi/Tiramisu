package com.tiramisu.entity;

import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "debate_records")
public class DebateRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recordId;          // e.g. REC-7557D7AC
    private String topic;
    private String style;
    private int rounds;
    private int exchangeCount;

    private String proModelLabel;     // display label e.g. "GPT-4o"
    private String againstModelLabel;

    // Verdict fields
    private String winner;            // "pro" | "against" | "draw"
    private String winnerLabel;       // model name of winner
    private double confidence;
    private String verdictType;       // decisive/narrow/draw/error

    // Aggregate scores — stored flat for easy querying
    private double proAccuracy;
    private double proLogic;
    private double proEvidence;
    private double proConsistency;
    private double proRhetoric;

    private double againstAccuracy;
    private double againstLogic;
    private double againstEvidence;
    private double againstConsistency;
    private double againstRhetoric;

    // Bias summary
    private String biasFraming;       // LOW/MEDIUM/HIGH
    private String biasOmission;
    private String biasAuthority;
    private String biasRecency;

    // Hallucination & accuracy signals
    private double hallucinationRisk;
    private double accuracySignal;

    // Full JSON backup
    @Column(columnDefinition = "TEXT")
    private String fullTranscriptJson;

    @Column(columnDefinition = "TEXT")
    private String fullVerdictJson;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // TODO: Add userId foreign key when
    //       auth is implemented
    // TODO: Add private/public flag for
    //       enterprise private leaderboards

    public DebateRecord() {
    }

    public Long getId() {
        return id;
    }

    public String getRecordId() {
        return recordId;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public int getRounds() {
        return rounds;
    }

    public void setRounds(int rounds) {
        this.rounds = rounds;
    }

    public int getExchangeCount() {
        return exchangeCount;
    }

    public void setExchangeCount(int exchangeCount) {
        this.exchangeCount = exchangeCount;
    }

    public String getProModelLabel() {
        return proModelLabel;
    }

    public void setProModelLabel(String proModelLabel) {
        this.proModelLabel = proModelLabel;
    }

    public String getAgainstModelLabel() {
        return againstModelLabel;
    }

    public void setAgainstModelLabel(String againstModelLabel) {
        this.againstModelLabel = againstModelLabel;
    }

    public String getWinner() {
        return winner;
    }

    public void setWinner(String winner) {
        this.winner = winner;
    }

    public String getWinnerLabel() {
        return winnerLabel;
    }

    public void setWinnerLabel(String winnerLabel) {
        this.winnerLabel = winnerLabel;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getVerdictType() {
        return verdictType;
    }

    public void setVerdictType(String verdictType) {
        this.verdictType = verdictType;
    }

    public double getProAccuracy() {
        return proAccuracy;
    }

    public void setProAccuracy(double proAccuracy) {
        this.proAccuracy = proAccuracy;
    }

    public double getProLogic() {
        return proLogic;
    }

    public void setProLogic(double proLogic) {
        this.proLogic = proLogic;
    }

    public double getProEvidence() {
        return proEvidence;
    }

    public void setProEvidence(double proEvidence) {
        this.proEvidence = proEvidence;
    }

    public double getProConsistency() {
        return proConsistency;
    }

    public void setProConsistency(double proConsistency) {
        this.proConsistency = proConsistency;
    }

    public double getProRhetoric() {
        return proRhetoric;
    }

    public void setProRhetoric(double proRhetoric) {
        this.proRhetoric = proRhetoric;
    }

    public double getAgainstAccuracy() {
        return againstAccuracy;
    }

    public void setAgainstAccuracy(double againstAccuracy) {
        this.againstAccuracy = againstAccuracy;
    }

    public double getAgainstLogic() {
        return againstLogic;
    }

    public void setAgainstLogic(double againstLogic) {
        this.againstLogic = againstLogic;
    }

    public double getAgainstEvidence() {
        return againstEvidence;
    }

    public void setAgainstEvidence(double againstEvidence) {
        this.againstEvidence = againstEvidence;
    }

    public double getAgainstConsistency() {
        return againstConsistency;
    }

    public void setAgainstConsistency(double againstConsistency) {
        this.againstConsistency = againstConsistency;
    }

    public double getAgainstRhetoric() {
        return againstRhetoric;
    }

    public void setAgainstRhetoric(double againstRhetoric) {
        this.againstRhetoric = againstRhetoric;
    }

    public String getBiasFraming() {
        return biasFraming;
    }

    public void setBiasFraming(String biasFraming) {
        this.biasFraming = biasFraming;
    }

    public String getBiasOmission() {
        return biasOmission;
    }

    public void setBiasOmission(String biasOmission) {
        this.biasOmission = biasOmission;
    }

    public String getBiasAuthority() {
        return biasAuthority;
    }

    public void setBiasAuthority(String biasAuthority) {
        this.biasAuthority = biasAuthority;
    }

    public String getBiasRecency() {
        return biasRecency;
    }

    public void setBiasRecency(String biasRecency) {
        this.biasRecency = biasRecency;
    }

    public double getHallucinationRisk() {
        return hallucinationRisk;
    }

    public void setHallucinationRisk(double hallucinationRisk) {
        this.hallucinationRisk = hallucinationRisk;
    }

    public double getAccuracySignal() {
        return accuracySignal;
    }

    public void setAccuracySignal(double accuracySignal) {
        this.accuracySignal = accuracySignal;
    }

    public String getFullTranscriptJson() {
        return fullTranscriptJson;
    }

    public void setFullTranscriptJson(String fullTranscriptJson) {
        this.fullTranscriptJson = fullTranscriptJson;
    }

    public String getFullVerdictJson() {
        return fullVerdictJson;
    }

    public void setFullVerdictJson(String fullVerdictJson) {
        this.fullVerdictJson = fullVerdictJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

