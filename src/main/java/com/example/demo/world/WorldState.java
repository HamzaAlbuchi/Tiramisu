package com.example.demo.world;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class WorldState {
    private long tick;
    private String worldName;
    private String description;
    private Agent pioneer;
    private final List<WorldEvent> events;

    public WorldState() {
        this.tick = 0L;
        this.worldName = "Island-1";
        this.description = "A lonely island surrounded by endless ocean.";
        this.events = new ArrayList<>();
    }

    public long getTick() {
        return tick;
    }

    public void setTick(long tick) {
        this.tick = tick;
    }

    public String getWorldName() {
        return worldName;
    }

    public void setWorldName(String worldName) {
        this.worldName = worldName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Agent getPioneer() {
        return pioneer;
    }

    public void setPioneer(Agent pioneer) {
        this.pioneer = pioneer;
    }

    public List<WorldEvent> getEvents() {
        return Collections.unmodifiableList(events);
    }

    public void addEvent(WorldEvent event) {
        this.events.add(event);
    }
}

