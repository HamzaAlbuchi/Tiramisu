package com.example.demo.world;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("WorldEvent")
class WorldEventTest {

    @Test
    void storesTickAndDescription() {
        WorldEvent ev = new WorldEvent(5L, "Something happened.");
        assertEquals(5L, ev.getTick());
        assertEquals("Something happened.", ev.getDescription());
    }

    @Test
    void timestampIsSet() {
        WorldEvent ev = new WorldEvent(0L, "Start");
        assertNotNull(ev.getTimestamp());
    }
}
