package com.example.demo.invite;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "invite_key_usage")
public class InviteKeyUsage {

    @Id
    @Column(name = "key_hash", nullable = false, length = 64)
    private String keyHash;

    @Column(name = "remaining_runs", nullable = false)
    private int remainingRuns;

    @Column(name = "last_used_at", nullable = true)
    private Instant lastUsedAt;

    public InviteKeyUsage() {}

    public InviteKeyUsage(String keyHash, int remainingRuns) {
        this.keyHash = keyHash;
        this.remainingRuns = remainingRuns;
        this.lastUsedAt = null;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public void setKeyHash(String keyHash) {
        this.keyHash = keyHash;
    }

    public int getRemainingRuns() {
        return remainingRuns;
    }

    public void setRemainingRuns(int remainingRuns) {
        this.remainingRuns = remainingRuns;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(Instant lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
}

