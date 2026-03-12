package com.example.demo.world;

import java.util.Random;

public class RuleBasedPetBrain implements AgentBrain {

    private final Random random = new Random();

    @Override
    public AgentDecision decide(WorldState world, Agent agent) {
        long tick = world.getTick();

        String action = pickAction();
        String bark = pickBark();

        String thought = String.format(
                "Tick %d: I am %s Eos. %s",
                tick, action, bark
        );

        String headline = "Island Companion:";
        String event = String.format(
                "%s Bony the dog is %s Eos, tail wagging.",
                headline, action
        );

        int dx = random.nextInt(3) - 1;
        int dy = random.nextInt(3) - 1;
        return new AgentDecision(thought, event, dx, dy);
    }

    private String pickAction() {
        String[] actions = {"trotting beside", "sniffing around", "watching the waves with", "digging in the sand near"};
        return actions[random.nextInt(actions.length)];
    }

    private String pickBark() {
        String[] barks = {
                "I bark softly at the wind.",
                "I perk my ears at distant sounds.",
                "I wag my tail, hoping for a friend.",
                "I chase a drifting leaf, then run back."
        };
        return barks[random.nextInt(barks.length)];
    }
}

