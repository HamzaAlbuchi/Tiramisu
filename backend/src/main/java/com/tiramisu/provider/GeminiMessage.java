package com.tiramisu.provider;

/**
 * One turn in a Gemini multi-turn {@code contents} array ({@code user} | {@code model}).
 */
public class GeminiMessage {

    /** {@code "user"} or {@code "model"} */
    private String role;
    private String text;

    public GeminiMessage() {
    }

    public GeminiMessage(String role, String text) {
        this.role = role;
        this.text = text;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
