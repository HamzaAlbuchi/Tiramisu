package com.example.demo.world;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Agent")
class AgentTest {

    private Agent agent;

    @BeforeEach
    void setUp() {
        agent = new Agent("Eos", AgentRole.FIRST_LIFE, "Island-1:shore");
    }

    @Nested
    @DisplayName("construction and identity")
    class Construction {
        @Test
        void hasNonBlankId() {
            assertNotNull(agent.getId());
            assertFalse(agent.getId().isEmpty());
        }

        @Test
        void idIsStable() {
            assertEquals(agent.getId(), agent.getId());
        }

        @Test
        void storesNameRoleAndLocation() {
            assertEquals("Eos", agent.getName());
            assertEquals(AgentRole.FIRST_LIFE, agent.getRole());
            assertEquals("Island-1:shore", agent.getLocation());
        }

        @Test
        void initialThoughtIsEmpty() {
            assertEquals("", agent.getCurrentThought());
        }

        @Test
        void initialMemoryIsEmpty() {
            assertTrue(agent.getMemory().isEmpty());
        }

        @Test
        void initialPathIsEmpty() {
            assertTrue(agent.getPath().isEmpty());
        }

        @Test
        void initialPositionIsZero() {
            assertEquals(0, agent.getPositionX());
            assertEquals(0, agent.getPositionY());
        }
    }

    @Nested
    @DisplayName("setters")
    class Setters {
        @Test
        void setName() {
            agent.setName("Alpha");
            assertEquals("Alpha", agent.getName());
        }

        @Test
        void setRole() {
            agent.setRole(AgentRole.PET_DOG);
            assertEquals(AgentRole.PET_DOG, agent.getRole());
        }

        @Test
        void setLocation() {
            agent.setLocation("Island-1:cliff");
            assertEquals("Island-1:cliff", agent.getLocation());
        }

        @Test
        void setCurrentThought() {
            agent.setCurrentThought("I am here.");
            assertEquals("I am here.", agent.getCurrentThought());
        }

        @Test
        void setPosition() {
            agent.setPositionX(3);
            agent.setPositionY(5);
            assertEquals(3, agent.getPositionX());
            assertEquals(5, agent.getPositionY());
        }
    }

    @Nested
    @DisplayName("memory")
    class Memory {
        @Test
        void rememberAddsToMemory() {
            agent.remember("First event.");
            List<String> memory = agent.getMemory();
            assertEquals(1, memory.size());
            assertEquals("First event.", memory.get(0));
        }

        @Test
        void rememberAppendsInOrder() {
            agent.remember("One");
            agent.remember("Two");
            agent.remember("Three");
            List<String> memory = agent.getMemory();
            assertEquals(3, memory.size());
            assertEquals("One", memory.get(0));
            assertEquals("Two", memory.get(1));
            assertEquals("Three", memory.get(2));
        }
    }

    @Nested
    @DisplayName("path")
    class Path {
        @Test
        void addPathPointAddsPosition() {
            agent.addPathPoint(1, 2);
            List<Position> path = agent.getPath();
            assertEquals(1, path.size());
            assertEquals(1, path.get(0).getX());
            assertEquals(2, path.get(0).getY());
        }

        @Test
        void addPathPointAppendsInOrder() {
            agent.addPathPoint(0, 0);
            agent.addPathPoint(1, 0);
            agent.addPathPoint(1, 1);
            List<Position> path = agent.getPath();
            assertEquals(3, path.size());
            assertEquals(1, path.get(1).getX());
            assertEquals(1, path.get(2).getY());
        }

        @Test
        void pathIsCappedAtMaxLength() {
            for (int i = 0; i < 30; i++) {
                agent.addPathPoint(i, i);
            }
            List<Position> path = agent.getPath();
            assertEquals(25, path.size());
            // First 5 points (0-4) were dropped; first retained is (5, 5)
            assertEquals(5, path.get(0).getX());
            assertEquals(29, path.get(path.size() - 1).getX());
        }
    }
}
