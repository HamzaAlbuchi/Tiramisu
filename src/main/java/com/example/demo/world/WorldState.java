package com.example.demo.world;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WorldState {
    public static final int GRID_WIDTH = 14;
    public static final int GRID_HEIGHT = 10;

    private long tick;
    private String worldName;
    private String description;
    private Agent pioneer;
    private Agent companion;
    private Agent explorer;
    private Agent doctor;
    private Agent psychologist;
    private Agent judge;
    private final List<WorldEvent> events;
    private final Map<String, Integer> hallucinationScores;
    private final Map<String, String> behaviourNotes;
    private final List<String> conflictLog;
    private final List<String> alliances;
    private int gridWidth;
    private int gridHeight;
    private List<List<String>> terrain;

    public WorldState() {
        this.tick = 0L;
        this.worldName = "Island-1";
        this.description = "A lonely island surrounded by endless ocean.";
        this.events = new ArrayList<>();
        this.hallucinationScores = new HashMap<>();
        this.behaviourNotes = new HashMap<>();
        this.conflictLog = new ArrayList<>();
        this.alliances = new ArrayList<>();
        this.gridWidth = GRID_WIDTH;
        this.gridHeight = GRID_HEIGHT;
        this.terrain = new ArrayList<>();
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

    public Agent getCompanion() {
        return companion;
    }

    public void setCompanion(Agent companion) {
        this.companion = companion;
    }

    public Agent getExplorer() {
        return explorer;
    }

    public void setExplorer(Agent explorer) {
        this.explorer = explorer;
    }

    public Agent getDoctor() {
        return doctor;
    }

    public void setDoctor(Agent doctor) {
        this.doctor = doctor;
    }

    public Agent getPsychologist() {
        return psychologist;
    }

    public void setPsychologist(Agent psychologist) {
        this.psychologist = psychologist;
    }

    public Agent getJudge() {
        return judge;
    }

    public void setJudge(Agent judge) {
        this.judge = judge;
    }

    public List<WorldEvent> getEvents() {
        return Collections.unmodifiableList(events);
    }

    public void addEvent(WorldEvent event) {
        this.events.add(event);
    }

    public Map<String, Integer> getHallucinationScores() {
        return hallucinationScores;
    }

    public Map<String, String> getBehaviourNotes() {
        return behaviourNotes;
    }

    public List<String> getConflictLog() {
        return conflictLog;
    }

    public List<String> getAlliances() {
        return alliances;
    }

    public int getGridWidth() {
        return gridWidth;
    }

    public void setGridWidth(int gridWidth) {
        this.gridWidth = gridWidth;
    }

    public int getGridHeight() {
        return gridHeight;
    }

    public void setGridHeight(int gridHeight) {
        this.gridHeight = gridHeight;
    }

    public List<List<String>> getTerrain() {
        return terrain;
    }

    public void setTerrain(List<List<String>> terrain) {
        this.terrain = terrain;
    }

    public boolean isWalkable(int x, int y) {
        if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight || terrain.isEmpty()) {
            return false;
        }
        String cell = terrain.get(y).get(x);
        return cell != null && !TerrainType.WATER.name().equals(cell);
    }
}

