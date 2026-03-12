package com.example.demo.world;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/world")
public class WorldController {

    private final WorldService worldService;

    public WorldController(WorldService worldService) {
        this.worldService = worldService;
    }

    @GetMapping("/state")
    public WorldState getState() {
        return worldService.getState();
    }

    @PostMapping("/reset")
    public WorldState reset() {
        worldService.resetWorld();
        return worldService.getState();
    }

    @PostMapping("/step")
    public WorldState step(@RequestParam(name = "ticks", defaultValue = "1") long ticks) {
        return worldService.step(ticks);
    }
}

