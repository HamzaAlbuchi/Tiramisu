package com.example.demo.world;

import java.time.Instant;

public class WorldEvent {
    private final long tick;
    private final Instant timestamp;
    private final String description;

    public WorldEvent(long tick, String description) {
        this.tick = tick;
        this.timestamp = Instant.now();
        this.description = description;
    }

    public long getTick() {
        return tick;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getDescription() {
        return description;
    }
}

