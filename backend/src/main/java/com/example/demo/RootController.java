package com.example.demo;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * The SPA is served separately (Vite): this service is API-only.
 * A root mapping avoids a confusing Whitelabel 404 when someone opens the API URL in a browser.
 */
@RestController
public class RootController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> root() {
        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("debate", "POST /api/debate");
        endpoints.put("worldState", "GET /api/world/state");
        endpoints.put("worldReset", "POST /api/world/reset");
        endpoints.put("worldStep", "POST /api/world/step?ticks=1");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "tiramisu-api");
        body.put("message", "REST only. Use your deployed frontend for the debate UI; call these paths from the browser or HTTP client.");
        body.put("endpoints", endpoints);
        return body;
    }

    @GetMapping(value = "/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> health() {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("status", "UP");
        return m;
    }
}
