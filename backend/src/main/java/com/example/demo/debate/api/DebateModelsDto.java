package com.example.demo.debate.api;

/** Display names for the two debaters. */
public class DebateModelsDto {

    private final String pro;
    private final String against;

    public DebateModelsDto(String pro, String against) {
        this.pro = pro;
        this.against = against;
    }

    public String getPro() {
        return pro;
    }

    public String getAgainst() {
        return against;
    }
}
