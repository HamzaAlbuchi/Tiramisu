package com.example.demo.world;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

public class Agent {
    private static final int MAX_PATH_LENGTH = 25;

    private final String id;
    private String name;
    private AgentRole role;
    private String location;
    private String currentThought;
    private final List<String> memory;
    private int positionX;
    private int positionY;
    private final List<Position> path;

    public Agent(String name, AgentRole role, String location) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.role = role;
        this.location = location;
        this.currentThought = "";
        this.memory = new ArrayList<>();
        this.path = new LinkedList<>();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AgentRole getRole() {
        return role;
    }

    public void setRole(AgentRole role) {
        this.role = role;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCurrentThought() {
        return currentThought;
    }

    public void setCurrentThought(String currentThought) {
        this.currentThought = currentThought;
    }

    public List<String> getMemory() {
        return memory;
    }

    public void remember(String eventDescription) {
        this.memory.add(eventDescription);
    }

    public int getPositionX() {
        return positionX;
    }

    public void setPositionX(int positionX) {
        this.positionX = positionX;
    }

    public int getPositionY() {
        return positionY;
    }

    public void setPositionY(int positionY) {
        this.positionY = positionY;
    }

    public List<Position> getPath() {
        return path;
    }

    public void addPathPoint(int x, int y) {
        path.add(new Position(x, y));
        while (path.size() > MAX_PATH_LENGTH) {
            path.remove(0);
        }
    }
}

