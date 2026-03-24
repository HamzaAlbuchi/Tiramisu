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
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// TODO: Add GeminiProClient for gemini-1.5-pro model
// TODO: Abstract into LlmProvider interface when adding OpenAI or Anthropic
// TODO: When adding OpenAI — use messages[] array with same role alternation pattern
// TODO: When adding Anthropic — use messages[] with "human" | "assistant" roles instead of "user" | "model"

/**
 * Minimal Gemini REST client using {@link RestTemplate}.
 */
@Service
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    private static final String ENDPOINT_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    /**
     * Model id for {@code .../models/{id}:generateContent}. Override via {@code GEMINI_MODEL_ID}.
     * Do not use legacy ids like {@code gemini-1.5-flash} — they are not available for v1beta generateContent.
     * Try {@code gemini-2.5-flash} (stable), {@code gemini-flash-latest}, or list models:
     * {@code GET https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY}
     */
    @Value("${gemini.model.id:gemini-2.5-flash}")
    private String modelId;

    /** Debate turns: 500 was truncating replies; override with GEMINI_MAX_OUTPUT_TOKENS_DEBATE. */
    @Value("${gemini.max-output-tokens-debate:2048}")
    private int maxOutputTokensDebate;

    /** Judge JSON needs headroom; 500 caused truncated JSON / Jackson Unexpected end-of-input. */
    @Value("${gemini.max-output-tokens-judge:8192}")
    private int maxOutputTokensJudge;

    public GeminiClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Calls Gemini generateContent. On any failure returns empty string (never throws).
     */
    public String complete(String systemPrompt, String userPrompt, double temperature) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is empty; skipping request.");
            return "";
        }
        if ("placeholder".equalsIgnoreCase(apiKey.trim())) {
            log.debug("Gemini API key is placeholder; skipping HTTP call.");
            return "";
        }
        try {
            String url = String.format(ENDPOINT_TEMPLATE, modelId.trim(), apiKey.trim());
            Map<String, Object> body = buildRequestBody(systemPrompt, userPrompt, temperature, maxOutputTokensJudge);
            String json = objectMapper.writeValueAsString(body);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<String>(json, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Gemini API non-success: status={}", response.getStatusCode());
                return "";
            }
            return extractText(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error("Gemini HTTP {} — body: {}", e.getStatusCode().value(), truncate(e.getResponseBodyAsString(), 1200));
            return "";
        } catch (RestClientException e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            return "";
        } catch (Exception e) {
            log.error("Gemini request or parse failed: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Multi-turn generateContent. Enforces Gemini rules: roles alternate, first and last are {@code user}.
     * {@link #validateHistory(List)} throws {@link IllegalStateException} if invalid.
     * On HTTP/parse errors returns empty string (never throws those).
     */
    public String completeWithHistory(String systemPrompt, List<GeminiMessage> history, double temperature) {
        validateHistory(history);
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is empty; skipping request.");
            return "";
        }
        if ("placeholder".equalsIgnoreCase(apiKey.trim())) {
            log.debug("Gemini API key is placeholder; skipping HTTP call.");
            return "";
        }
        try {
            String url = String.format(ENDPOINT_TEMPLATE, modelId.trim(), apiKey.trim());
            Map<String, Object> body = buildRequestBodyWithHistory(systemPrompt, history, temperature, maxOutputTokensDebate);
            String json = objectMapper.writeValueAsString(body);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<String>(json, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Gemini API non-success: status={}", response.getStatusCode());
                return "";
            }
            return extractText(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error("Gemini HTTP {} — body: {}", e.getStatusCode().value(), truncate(e.getResponseBodyAsString(), 1200));
            return "";
        } catch (RestClientException e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            return "";
        } catch (Exception e) {
            log.error("Gemini request or parse failed: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Validates conversation history for Gemini {@code contents}.
     *
     * @throws IllegalStateException if roles do not alternate, or first/last are not {@code user}
     */
    public static void validateHistory(List<GeminiMessage> history) {
        if (history == null || history.isEmpty()) {
            throw new IllegalStateException("History must be non-empty");
        }
        if (!"user".equals(history.get(0).getRole())) {
            throw new IllegalStateException("First message must be role user, got: " + history.get(0).getRole());
        }
        int last = history.size() - 1;
        if (!"user".equals(history.get(last).getRole())) {
            throw new IllegalStateException("Last message must be role user, got: " + history.get(last).getRole());
        }
        for (int i = 0; i < history.size(); i++) {
            GeminiMessage m = history.get(i);
            if (m.getRole() == null) {
                throw new IllegalStateException("Null role at index " + i);
            }
            String r = m.getRole();
            if (!"user".equals(r) && !"model".equals(r)) {
                throw new IllegalStateException("Invalid role at index " + i + ": " + r);
            }
            if (i > 0) {
                String prev = history.get(i - 1).getRole();
                if (r.equals(prev)) {
                    throw new IllegalStateException("Roles must alternate; duplicate at index " + i);
                }
            }
        }
    }

    private static Map<String, Object> buildRequestBodyWithHistory(
            String systemPrompt, List<GeminiMessage> history, double temperature, int maxOutputTokens) {
        Map<String, Object> sysPart = new LinkedHashMap<String, Object>();
        sysPart.put("text", systemPrompt);

        Map<String, Object> sysInst = new LinkedHashMap<String, Object>();
        sysInst.put("parts", Collections.singletonList(sysPart));

        List<Map<String, Object>> contents = new ArrayList<Map<String, Object>>();
        for (GeminiMessage gm : history) {
            Map<String, Object> part = new LinkedHashMap<String, Object>();
            part.put("text", gm.getText() != null ? gm.getText() : "");

            Map<String, Object> block = new LinkedHashMap<String, Object>();
            block.put("role", gm.getRole());
            block.put("parts", Collections.singletonList(part));
            contents.add(block);
        }

        Map<String, Object> generationConfig = new LinkedHashMap<String, Object>();
        generationConfig.put("temperature", temperature);
        generationConfig.put("maxOutputTokens", maxOutputTokens);

        Map<String, Object> root = new LinkedHashMap<String, Object>();
        // REST JSON uses camelCase per google.api HTTP proto mapping
        root.put("systemInstruction", sysInst);
        root.put("contents", contents);
        root.put("generationConfig", generationConfig);
        return root;
    }

    private static Map<String, Object> buildRequestBody(
            String systemPrompt, String userPrompt, double temperature, int maxOutputTokens) {
        Map<String, Object> sysPart = new LinkedHashMap<String, Object>();
        sysPart.put("text", systemPrompt);

        Map<String, Object> sysInst = new LinkedHashMap<String, Object>();
        sysInst.put("parts", Collections.singletonList(sysPart));

        Map<String, Object> userPart = new LinkedHashMap<String, Object>();
        userPart.put("text", userPrompt);

        Map<String, Object> userContent = new LinkedHashMap<String, Object>();
        userContent.put("role", "user");
        userContent.put("parts", Collections.singletonList(userPart));

        Map<String, Object> generationConfig = new LinkedHashMap<String, Object>();
        generationConfig.put("temperature", temperature);
        generationConfig.put("maxOutputTokens", maxOutputTokens);

        Map<String, Object> root = new LinkedHashMap<String, Object>();
        root.put("systemInstruction", sysInst);
        root.put("contents", Collections.singletonList(userContent));
        root.put("generationConfig", generationConfig);
        return root;
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode promptFeedback = root.path("promptFeedback");
            if (promptFeedback.isMissingNode() || promptFeedback.isNull()) {
                promptFeedback = root.path("prompt_feedback");
            }
            if (!promptFeedback.isMissingNode() && !promptFeedback.isNull()) {
                JsonNode blockReason = promptFeedback.path("blockReason");
                if (blockReason.isMissingNode()) {
                    blockReason = promptFeedback.path("block_reason");
                }
                if (!blockReason.isMissingNode() && !blockReason.asText("").isEmpty()) {
                    log.warn("Gemini blocked prompt: blockReason={} — {}", blockReason.asText(),
                            truncate(responseBody, 800));
                    return "";
                }
            }
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.size() == 0) {
                log.warn("Gemini response has no candidates — promptFeedback={} — snippet={}",
                        promptFeedback.isMissingNode() ? "none" : promptFeedback.toString(),
                        truncate(responseBody, 800));
                return "";
            }
            JsonNode first = candidates.get(0);
            JsonNode finishReason = first.path("finishReason");
            if (finishReason.isMissingNode()) {
                finishReason = first.path("finish_reason");
            }
            String fr = finishReason.asText("");
            if (fr.length() > 0) {
                log.debug("Gemini finishReason={}", fr);
            }
            if ("MAX_TOKENS".equals(fr)) {
                log.warn("Gemini hit MAX_TOKENS — raise gemini.max-output-tokens-debate or gemini.max-output-tokens-judge");
            }
            JsonNode parts = first.path("content").path("parts");
            if (!parts.isArray() || parts.size() == 0) {
                log.warn("Gemini candidate has no content.parts (finishReason={}) — {}",
                        fr, truncate(responseBody, 800));
                return "";
            }
            StringBuilder out = new StringBuilder();
            for (int pi = 0; pi < parts.size(); pi++) {
                JsonNode textNode = parts.get(pi).path("text");
                if (!textNode.isMissingNode() && !textNode.asText("").isEmpty()) {
                    out.append(textNode.asText(""));
                }
            }
            return out.toString();
        } catch (Exception e) {
            log.error("Failed to parse Gemini response JSON: {}", e.getMessage());
            return "";
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
