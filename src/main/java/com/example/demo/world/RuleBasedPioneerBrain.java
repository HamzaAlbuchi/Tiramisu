package com.example.demo.world;

import java.util.Random;

public class RuleBasedPioneerBrain implements AgentBrain {

    private final Random random = new Random();

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        long tick = world.getTick();

        String mood = pickMood(tick);
        String area = pickArea();

        String thought = String.format(
                "Tick %d: I wander along the %s, feeling %s as I search for signs of other life.",
                tick, area, mood
        );

        String headline = pickHeadlinePrefix();
        String event = String.format(
                "%s Eos explores the %s, listening for a voice that is not their own.",
                headline, area
        );

        int dx = random.nextInt(3) - 1;
        int dy = random.nextInt(3) - 1;
        return new AgentDecision(thought, event, dx, dy);
    }

    private String pickMood(long tick) {
        int phase = (int) (tick % 4);
        switch (phase) {
            case 0:
                return "curious";
            case 1:
                return "hopeful";
            case 2:
                return "restless";
            default:
                return "a little lonely";
        }
    }

    private String pickArea() {
        String[] areas = {"shoreline", "palm grove", "rocky cliffs", "lagoon edge"};
        return areas[random.nextInt(areas.length)];
    }

    private String pickHeadlinePrefix() {
        String[] prefixes = {"World Update:", "Breaking:", "Island Report:"};
        return prefixes[random.nextInt(prefixes.length)];
    }
}

