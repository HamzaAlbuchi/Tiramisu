package com.example.demo.debate.api;

/** Body for {@code POST /api/debate/custom/test}. */
public class DebateCustomTestRequest {

    private String endpointUrl = "";
    private String apiKey = "";
    private String modelId = "";

    public String getEndpointUrl() {
        return endpointUrl;
    }

    public void setEndpointUrl(String endpointUrl) {
        this.endpointUrl = endpointUrl != null ? endpointUrl : "";
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey != null ? apiKey : "";
    }

    public String getModelId() {
        return modelId;
    }

    public void setModelId(String modelId) {
        this.modelId = modelId != null ? modelId : "";
    }
}
