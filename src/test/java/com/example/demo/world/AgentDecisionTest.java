package com.example.demo.world;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AgentDecision")
class AgentDecisionTest {

    @Nested
    @DisplayName("two-arg constructor (no movement)")
    class TwoArgConstructor {
        @Test
        void storesThoughtAndEvent() {
            AgentDecision d = new AgentDecision("I think.", "World event.");
            assertEquals("I think.", d.getNewThought());
            assertEquals("World event.", d.getWorldEventDescription());
        }

        @Test
        void movementDeltasAreNull() {
            AgentDecision d = new AgentDecision("x", "y");
            assertNull(d.getDeltaX());
            assertNull(d.getDeltaY());
        }
    }

    @Nested
    @DisplayName("four-arg constructor (with movement)")
    class FourArgConstructor {
        @Test
        void storesThoughtEventAndDeltas() {
            AgentDecision d = new AgentDecision("Go north.", "Moved.", 0, -1);
            assertEquals("Go north.", d.getNewThought());
            assertEquals("Moved.", d.getWorldEventDescription());
            assertEquals(0, d.getDeltaX());
            assertEquals(-1, d.getDeltaY());
        }

        @Test
        void allowsNullDeltas() {
            AgentDecision d = new AgentDecision("a", "b", null, null);
            assertNull(d.getDeltaX());
            assertNull(d.getDeltaY());
        }
    }
}
