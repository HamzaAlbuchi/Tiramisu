package com.tiramisu.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BiasSummary {

    private String framing;
    private String omission;
    private String authority;
    private String recency;

    public BiasSummary() {
    }

    public String getFraming() {
        return framing;
    }

    public void setFraming(String framing) {
        this.framing = framing;
    }

    public String getOmission() {
        return omission;
    }

    public void setOmission(String omission) {
        this.omission = omission;
    }

    public String getAuthority() {
        return authority;
    }

    public void setAuthority(String authority) {
        this.authority = authority;
    }

    public String getRecency() {
        return recency;
    }

    public void setRecency(String recency) {
        this.recency = recency;
    }
}
