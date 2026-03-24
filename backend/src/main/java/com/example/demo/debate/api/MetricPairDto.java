package com.example.demo.debate.api;

/** Same rubric dimension for Pro (A) and Against (B), 0–10. */
public class MetricPairDto {

    private final double pro;
    private final double against;

    public MetricPairDto(double pro, double against) {
        this.pro = pro;
        this.against = against;
    }

    public double getPro() {
        return pro;
    }

    public double getAgainst() {
        return against;
    }
}
