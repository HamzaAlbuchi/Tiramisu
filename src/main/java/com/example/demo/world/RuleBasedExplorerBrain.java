package com.example.demo.world;

import java.util.Random;

public class RuleBasedExplorerBrain implements AgentBrain {

    private final Random random = new Random();

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        long tick = world.getTick();

        String action = pickAction();
        String thought = String.format(
                "Tick %d: I am %s. Maybe I will find someone else on this island.",
                tick, action
        );

        String headline = "Island Report:";
        String event = String.format(
                "%s Nova the explorer is %s, scanning the horizon.",
                headline, action
        );

        int dx = random.nextInt(3) - 1;
        int dy = random.nextInt(3) - 1;
        return new AgentDecision(thought, event, dx, dy);
    }

    private String pickAction() {
        String[] actions = {
                "circling the lagoon",
                "climbing toward the cliffs",
                "walking the shoreline",
                "pushing through the palms",
                "pausing to listen"
        };
        return actions[random.nextInt(actions.length)];
    }
}
