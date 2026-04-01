package com.example.demo.invite;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Optional;

@Service
public class InviteKeyUsageService {

    private final InviteKeyUsageRepository repo;

    @Value("${app.invite.max-runs:3}")
    private int maxRuns;

    public InviteKeyUsageService(InviteKeyUsageRepository repo) {
        this.repo = repo;
    }

    public static String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (int i = 0; i < digest.length; i++) {
                sb.append(String.format("%02x", digest[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not hash key", e);
        }
    }

    @Transactional
    public int consumeOneRun(String rawKey) {
        if (rawKey == null) rawKey = "";
        String trimmed = rawKey.trim();
        String hash = sha256Hex(trimmed);

        Optional<InviteKeyUsage> existing = repo.findById(hash);
        InviteKeyUsage usage = existing.orElseGet(() -> new InviteKeyUsage(hash, Math.max(0, maxRuns)));

        int remaining = usage.getRemainingRuns();
        if (remaining <= 0) {
            usage.setRemainingRuns(0);
            usage.setLastUsedAt(Instant.now());
            repo.save(usage);
            return -1;
        }
        usage.setRemainingRuns(remaining - 1);
        usage.setLastUsedAt(Instant.now());
        repo.save(usage);
        return usage.getRemainingRuns();
    }
}

