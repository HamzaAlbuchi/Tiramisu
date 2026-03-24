package com.example.demo.debate.api;

/** Aggregate bias levels from the judge. */
public class BiasSummaryDto {

    private final String framing;
    private final String omission;
    private final String authority;
    private final String recency;

    public BiasSummaryDto(String framing, String omission, String authority, String recency) {
        this.framing = framing;
        this.omission = omission;
        this.authority = authority;
        this.recency = recency;
    }

    public String getFraming() {
        return framing;
    }

    public String getOmission() {
        return omission;
    }

    public String getAuthority() {
        return authority;
    }

    public String getRecency() {
        return recency;
    }
}
