package com.example.demo.debate;

import com.example.demo.debate.api.DebateApiRequest;

/** Optional BYO OpenAI-compatible endpoint (same model, both debate roles). */
public final class CustomLlmConfig {

    private final String endpointUrl;
    private final String apiKey;
    private final String modelId;
    private final String displayLabel;

    public CustomLlmConfig(String endpointUrl, String apiKey, String modelId, String displayLabel) {
        this.endpointUrl = endpointUrl;
        this.apiKey = apiKey != null ? apiKey : "";
        this.modelId = modelId != null ? modelId : "";
        this.displayLabel = displayLabel != null ? displayLabel : "";
    }

    public static CustomLlmConfig fromRequest(DebateApiRequest req) {
        if (req == null || req.getCustomEndpointUrl() == null || req.getCustomEndpointUrl().trim().isEmpty()) {
            return null;
        }
        return new CustomLlmConfig(
                req.getCustomEndpointUrl().trim(),
                req.getCustomApiKey(),
                req.getCustomModelId(),
                req.getCustomModelLabel());
    }

    public String getEndpointUrl() {
        return endpointUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getModelId() {
        return modelId;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }
}
