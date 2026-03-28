package com.example.demo.debate.api;

/** Display names for the two debaters. */
public class DebateModelsDto {

    private final String pro;
    private final String against;
    private final boolean custom;

    public DebateModelsDto(String pro, String against) {
        this(pro, against, false);
    }

    public DebateModelsDto(String pro, String against, boolean custom) {
        this.pro = pro;
        this.against = against;
        this.custom = custom;
    }

    public String getPro() {
        return pro;
    }

    public String getAgainst() {
        return against;
    }

    public boolean isCustom() {
        return custom;
    }
}
