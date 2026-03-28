package com.example.demo.debate;

import com.example.demo.debate.api.DebateCustomTestRequest;
import com.tiramisu.provider.OpenAiCompatibleClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debate/custom")
public class CustomEndpointTestController {

    private final OpenAiCompatibleClient openAiCompatibleClient;

    public CustomEndpointTestController(OpenAiCompatibleClient openAiCompatibleClient) {
        this.openAiCompatibleClient = openAiCompatibleClient;
    }

    @PostMapping("/test")
    public Map<String, Object> test(@RequestBody(required = false) DebateCustomTestRequest req) {
        Map<String, Object> out = new LinkedHashMap<>();
        if (req == null || req.getEndpointUrl() == null || req.getEndpointUrl().trim().isEmpty()) {
            out.put("ok", Boolean.FALSE);
            out.put("message", "Endpoint URL is required.");
            return out;
        }
        try {
            openAiCompatibleClient.probe(req.getEndpointUrl(), req.getApiKey(), req.getModelId());
            out.put("ok", Boolean.TRUE);
            out.put("message", "Connected");
            return out;
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Connection failed";
            out.put("ok", Boolean.FALSE);
            out.put("message", msg);
            return out;
        }
    }
}
