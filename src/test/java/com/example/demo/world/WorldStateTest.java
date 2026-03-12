package com.example.demo.world;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("WorldState")
class WorldStateTest {

    private WorldState state;

    @BeforeEach
    void setUp() {
        state = new WorldState();
    }

    @Nested
    @DisplayName("initial state")
    class InitialState {
        @Test
        void tickStartsAtZero() {
            assertEquals(0L, state.getTick());
        }

        @Test
        void hasDefaultWorldNameAndDescription() {
            assertEquals("Island-1", state.getWorldName());
            assertTrue(state.getDescription().contains("island"));
        }

        @Test
        void gridDimensionsMatchConstants() {
            assertEquals(WorldState.GRID_WIDTH, state.getGridWidth());
            assertEquals(WorldState.GRID_HEIGHT, state.getGridHeight());
        }

        @Test
        void eventsListIsEmpty() {
            assertTrue(state.getEvents().isEmpty());
        }

        @Test
        void eventsListIsUnmodifiable() {
            assertThrows(UnsupportedOperationException.class, () ->
                    state.getEvents().add(new WorldEvent(0, "x")));
        }

        @Test
        void hallucinationScoresIsEmpty() {
            assertTrue(state.getHallucinationScores().isEmpty());
        }

        @Test
        void conflictLogIsEmpty() {
            assertTrue(state.getConflictLog().isEmpty());
        }

        @Test
        void alliancesIsEmpty() {
            assertTrue(state.getAlliances().isEmpty());
        }

        @Test
        void noAgentsByDefault() {
            assertNull(state.getPioneer());
            assertNull(state.getCompanion());
            assertNull(state.getDoctor());
            assertNull(state.getPsychologist());
            assertNull(state.getJudge());
        }
    }

    @Nested
    @DisplayName("tick and metadata")
    class TickAndMetadata {
        @Test
        void setTick() {
            state.setTick(42L);
            assertEquals(42L, state.getTick());
        }

        @Test
        void setWorldNameAndDescription() {
            state.setWorldName("Island-2");
            state.setDescription("A second island.");
            assertEquals("Island-2", state.getWorldName());
            assertEquals("A second island.", state.getDescription());
        }

        @Test
        void setGridDimensions() {
            state.setGridWidth(20);
            state.setGridHeight(15);
            assertEquals(20, state.getGridWidth());
            assertEquals(15, state.getGridHeight());
        }
    }

    @Nested
    @DisplayName("agents")
    class Agents {
        @Test
        void setPioneer() {
            Agent a = new Agent("Eos", AgentRole.FIRST_LIFE, "shore");
            state.setPioneer(a);
            assertSame(a, state.getPioneer());
        }

        @Test
        void setCompanion() {
            Agent a = new Agent("Bony", AgentRole.PET_DOG, "shore");
            state.setCompanion(a);
            assertSame(a, state.getCompanion());
        }

        @Test
        void setDoctorPsychologistJudge() {
            Agent doc = new Agent("Dr. X", AgentRole.DOCTOR, "tent");
            Agent psych = new Agent("Dr. Y", AgentRole.PSYCHOLOGIST, "cliff");
            Agent judge = new Agent("Arbitra", AgentRole.JUDGE, "circle");
            state.setDoctor(doc);
            state.setPsychologist(psych);
            state.setJudge(judge);
            assertSame(doc, state.getDoctor());
            assertSame(psych, state.getPsychologist());
            assertSame(judge, state.getJudge());
        }
    }

    @Nested
    @DisplayName("events")
    class Events {
        @Test
        void addEventAppendsAndIsVisibleInList() {
            state.addEvent(new WorldEvent(1L, "First"));
            state.addEvent(new WorldEvent(2L, "Second"));
            assertEquals(2, state.getEvents().size());
            assertEquals(1L, state.getEvents().get(0).getTick());
            assertEquals("First", state.getEvents().get(0).getDescription());
            assertEquals(2L, state.getEvents().get(1).getTick());
            assertEquals("Second", state.getEvents().get(1).getDescription());
        }
    }

    @Nested
    @DisplayName("terrain and isWalkable")
    class Terrain {
        @Test
        void isWalkableReturnsFalseWhenTerrainEmpty() {
            assertTrue(state.getTerrain().isEmpty());
            assertFalse(state.isWalkable(0, 0));
            assertFalse(state.isWalkable(5, 5));
        }

        @Test
        void isWalkableReturnsFalseOutOfBounds() {
            buildSimpleTerrain(3, 3);
            assertFalse(state.isWalkable(-1, 0));
            assertFalse(state.isWalkable(0, -1));
            assertFalse(state.isWalkable(3, 0));
            assertFalse(state.isWalkable(0, 3));
        }

        @Test
        void isWalkableReturnsFalseForWater() {
            buildSimpleTerrain(2, 2);
            state.getTerrain().get(0).set(0, TerrainType.WATER.name());
            assertFalse(state.isWalkable(0, 0));
        }

        @Test
        void isWalkableReturnsTrueForNonWater() {
            buildSimpleTerrain(2, 2);
            state.getTerrain().get(0).set(0, TerrainType.SAND.name());
            state.getTerrain().get(0).set(1, TerrainType.GRASS.name());
            assertTrue(state.isWalkable(0, 0));
            assertTrue(state.isWalkable(1, 0));
        }
    }

    @Nested
    @DisplayName("tracking maps and lists")
    class Tracking {
        @Test
        void hallucinationScoresIsMutable() {
            state.getHallucinationScores().put("agent-1", 2);
            assertEquals(2, state.getHallucinationScores().get("agent-1"));
        }

        @Test
        void behaviourNotesIsMutable() {
            state.getBehaviourNotes().put("agent-1", "Stable mood.");
            assertEquals("Stable mood.", state.getBehaviourNotes().get("agent-1"));
        }

        @Test
        void conflictLogIsMutable() {
            state.getConflictLog().add("Tick 1: Conflict.");
            assertEquals(1, state.getConflictLog().size());
            assertEquals("Tick 1: Conflict.", state.getConflictLog().get(0));
        }

        @Test
        void alliancesIsMutable() {
            state.getAlliances().add("Eos-Bony");
            assertEquals(1, state.getAlliances().size());
            assertEquals("Eos-Bony", state.getAlliances().get(0));
        }
    }

    private void buildSimpleTerrain(int w, int h) {
        List<List<String>> grid = new ArrayList<>();
        for (int y = 0; y < h; y++) {
            List<String> row = new ArrayList<>();
            for (int x = 0; x < w; x++) {
                row.add(TerrainType.SAND.name());
            }
            grid.add(row);
        }
        state.setTerrain(grid);
        state.setGridWidth(w);
        state.setGridHeight(h);
    }
}
