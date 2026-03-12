package com.example.demo.world;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Agent {
    private final String id;
    private String name;
    private AgentRole role;
    private String location;
    private String currentThought;
    private final List<String> memory;

    public Agent(String name, AgentRole role, String location) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.role = role;
        this.location = location;
        this.currentThought = "";
        this.memory = new ArrayList<>();
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
}

