package com.tiramisu.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * OpenAI-style Chat Completions client ({@code POST …/v1/chat/completions}) for BYO endpoints.
 */
@Service
public class OpenAiCompatibleClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${debate.custom.max-output-tokens:2048}")
    private int maxOutputTokensDebate;

    @Value("${debate.custom.probe-max-tokens:8}")
    private int probeMaxTokens;

    public OpenAiCompatibleClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Normalizes user paste to a full chat-completions URL.
     */
    public static String resolveChatCompletionsUrl(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            throw new IllegalArgumentException("Endpoint URL is required.");
        }
        String u = raw.trim();
        if (!u.matches("(?i)^https?://")) {
            if (u.startsWith("//")) {
                u = "https:" + u;
            } else if (u.startsWith("localhost") || u.startsWith("127.0.0.1")) {
                u = "http://" + u;
            } else {
                u = "https://" + u;
            }
        }
        while (u.endsWith("/")) {
            u = u.substring(0, u.length() - 1);
        }
        String lower = u.toLowerCase(Locale.ROOT);
        if (lower.endsWith("/chat/completions")) {
            return u;
        }
        if (lower.endsWith("/v1")) {
            return u + "/chat/completions";
        }
        return u + "/v1/chat/completions";
    }

    /**
     * Lightweight request to verify URL, auth, and model id. Throws on failure with a short message.
     */
    public void probe(String endpointUrl, String apiKey, String modelId) {
        String url = resolveChatCompletionsUrl(endpointUrl);
        String model = (modelId == null || modelId.isBlank()) ? "gpt-4o-mini" : modelId.trim();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "user", "content", "Reply with exactly: OK"));
        body.put("messages", messages);
        body.put("max_tokens", probeMaxTokens);

        postForContent(url, apiKey, body, "probe");
    }

    public String completeWithHistory(
            String endpointUrl,
            String apiKey,
            String modelId,
            String systemPrompt,
            List<GeminiMessage> history,
            double temperature,
            int maxOutputTokens) {
        GeminiClient.validateHistory(history);
        String url = resolveChatCompletionsUrl(endpointUrl);
        String model = (modelId == null || modelId.isBlank()) ? "gpt-4o-mini" : modelId.trim();

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> sys = new LinkedHashMap<>();
        sys.put("role", "system");
        sys.put("content", systemPrompt != null ? systemPrompt : "");
        messages.add(sys);
        for (GeminiMessage gm : history) {
            String openAiRole = "user".equals(gm.getRole()) ? "user" : "assistant";
            Map<String, String> m = new LinkedHashMap<>();
            m.put("role", openAiRole);
            m.put("content", gm.getText() != null ? gm.getText() : "");
            messages.add(m);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", temperature);
        body.put("max_tokens", maxOutputTokens > 0 ? maxOutputTokens : maxOutputTokensDebate);

        try {
            return postForContent(url, apiKey, body, "debate");
        } catch (RuntimeException e) {
            log.warn("Custom LLM completion failed: {}", e.getMessage());
            return "";
        }
    }

    private String postForContent(String url, String apiKey, Map<String, Object> body, String logCtx) {
        try {
            String json = objectMapper.writeValueAsString(body);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.setBearerAuth(apiKey.trim());
            }
            HttpEntity<String> entity = new HttpEntity<>(json, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new IllegalStateException("HTTP " + response.getStatusCode().value());
            }
            return extractAssistantText(response.getBody(), logCtx);
        } catch (HttpStatusCodeException e) {
            String snippet = truncate(e.getResponseBodyAsString(), 400);
            throw new IllegalStateException("HTTP " + e.getStatusCode().value() + (snippet.isEmpty() ? "" : ": " + snippet), e);
        } catch (RestClientException e) {
            throw new IllegalStateException(e.getMessage() != null ? e.getMessage() : "Request failed", e);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage() != null ? e.getMessage() : "Request failed", e);
        }
    }

    private String extractAssistantText(String responseBody, String logCtx) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode err = root.path("error");
            if (!err.isMissingNode() && !err.isNull()) {
                JsonNode msg = err.path("message");
                String m = msg.isMissingNode() || msg.asText("").isEmpty() ? err.toString() : msg.asText("");
                throw new IllegalStateException(m);
            }
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.size() == 0) {
                log.warn("OpenAI-compat {}: no choices — {}", logCtx, truncate(responseBody, 600));
                throw new IllegalStateException("No choices in provider response.");
            }
            JsonNode message = choices.get(0).path("message");
            JsonNode content = message.path("content");
            if (content.isTextual()) {
                return content.asText("");
            }
            // Some providers return array of content parts
            if (content.isArray() && content.size() > 0) {
                StringBuilder sb = new StringBuilder();
                for (JsonNode part : content) {
                    JsonNode text = part.path("text");
                    if (text.isTextual()) {
                        sb.append(text.asText());
                    }
                }
                return sb.toString();
            }
            log.warn("OpenAI-compat {}: unparseable message — {}", logCtx, truncate(responseBody, 600));
            return "";
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Parse OpenAI-compat response: {}", e.getMessage());
            throw new IllegalStateException("Invalid JSON from provider.", e);
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.trim();
        if (t.length() <= max) {
            return t;
        }
        return t.substring(0, max) + "…";
    }
}
