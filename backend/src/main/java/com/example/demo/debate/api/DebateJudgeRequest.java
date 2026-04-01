package com.example.demo.debate.api;

import java.util.ArrayList;
import java.util.List;

/**
 * Request body for judge-only retry: takes an existing transcript and re-runs the judge.
 * Kept mutable for Jackson.
 */
public class DebateJudgeRequest {

    private String topic = "";
    private String style = "balanced";
    private int rounds = 2;
    private int exchangeCount = 0;
    private Models models = new Models();
    private List<Turn> turns = new ArrayList<Turn>();

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic != null ? topic : "";
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style != null ? style : "balanced";
    }

    public int getRounds() {
        return rounds;
    }

    public void setRounds(int rounds) {
        this.rounds = rounds;
    }

    public int getExchangeCount() {
        return exchangeCount;
    }

    public void setExchangeCount(int exchangeCount) {
        this.exchangeCount = exchangeCount;
    }

    public Models getModels() {
        return models;
    }

    public void setModels(Models models) {
        this.models = models != null ? models : new Models();
    }

    public List<Turn> getTurns() {
        return turns;
    }

    public void setTurns(List<Turn> turns) {
        this.turns = turns != null ? turns : new ArrayList<Turn>();
    }

    public static class Models {
        private String pro = "";
        private String against = "";
        private boolean custom = false;

        public String getPro() {
            return pro;
        }

        public void setPro(String pro) {
            this.pro = pro != null ? pro : "";
        }

        public String getAgainst() {
            return against;
        }

        public void setAgainst(String against) {
            this.against = against != null ? against : "";
        }

        public boolean isCustom() {
            return custom;
        }

        public void setCustom(boolean custom) {
            this.custom = custom;
        }
    }

    public static class Turn {
        private int index = 0;
        private String side = "";
        private String modelName = "";
        private String role = "";
        private String text = "";
        private double temperature = 0.0;

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }

        public String getSide() {
            return side;
        }

        public void setSide(String side) {
            this.side = side != null ? side : "";
        }

        public String getModelName() {
            return modelName;
        }

        public void setModelName(String modelName) {
            this.modelName = modelName != null ? modelName : "";
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role != null ? role : "";
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text != null ? text : "";
        }

        public double getTemperature() {
            return temperature;
        }

        public void setTemperature(double temperature) {
            this.temperature = temperature;
        }
    }
}

