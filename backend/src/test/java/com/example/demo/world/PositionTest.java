package com.example.demo.world;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Position")
class PositionTest {

    @Test
    void storesXAndY() {
        Position p = new Position(3, 7);
        assertEquals(3, p.getX());
        assertEquals(7, p.getY());
    }

    @Test
    void allowsZero() {
        Position p = new Position(0, 0);
        assertEquals(0, p.getX());
        assertEquals(0, p.getY());
    }
}
