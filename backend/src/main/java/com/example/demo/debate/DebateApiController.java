package com.example.demo.debate;

import com.example.demo.debate.api.DebateApiRequest;
import com.example.demo.debate.api.DebateApiResponse;
import com.example.demo.debate.api.DebateModelsDto;
import com.example.demo.debate.api.DebateStreamMetaDto;
import com.example.demo.debate.api.DebateTurnDto;
import com.tiramisu.stats.DebatePersistenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debate")
public class DebateApiController {

    private static final Logger log = LoggerFactory.getLogger(DebateApiController.class);

    /** Debate + judge can exceed default SSE timeouts on slow providers. */
    private static final long SSE_TIMEOUT_MS = 30L * 60 * 1000;

    private final DebateService debateService;
    private final JudgeService judgeService;
    private final DebatePersistenceService persistenceService;
    private final TaskExecutor taskExecutor;

    public DebateApiController(
            DebateService debateService,
            JudgeService judgeService,
            DebatePersistenceService persistenceService,
            @Qualifier("applicationTaskExecutor") TaskExecutor taskExecutor) {
        this.debateService = debateService;
        this.judgeService = judgeService;
        this.persistenceService = persistenceService;
        this.taskExecutor = taskExecutor;
    }

    @PostMapping
    public DebateApiResponse run(@RequestBody(required = false) DebateApiRequest request) {
        if (request == null) {
            request = new DebateApiRequest();
        }
        int rounds = request.getRounds();
        String style = request.getStyle() != null ? request.getStyle() : "balanced";
        DebateResult result = debateService.runDebateWithRounds(request.getTopic(), rounds, style);
        DebateApiResponse api = judgeService.toApiResponse(result, style, rounds);
        persistenceService.persist(api);
        return api;
    }

    /**
     * Server-Sent Events: {@code meta} (session info), {@code turn} per message, {@code complete} (full
     * {@link DebateApiResponse}), or {@code error} then close.
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestBody(required = false) DebateApiRequest request) {
        final DebateApiRequest req = request != null ? request : new DebateApiRequest();
        final int rounds = req.getRounds();
        final String style = req.getStyle() != null ? req.getStyle() : "balanced";

        final SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        taskExecutor.execute(() -> {
            try {
                DebateResult result = debateService.runDebateWithRoundsStreaming(
                        req.getTopic(),
                        rounds,
                        style,
                        meta -> {
                            DebateStreamMetaDto dto = new DebateStreamMetaDto(
                                    meta.getTopic(),
                                    meta.getStyle(),
                                    meta.getRequestedRounds(),
                                    meta.getExchangeCount(),
                                    new DebateModelsDto(meta.getModelA(), meta.getModelB()));
                            safeSend(emitter, "meta", dto);
                        },
                        (idx, ex) -> {
                            DebateTurnDto turn = new DebateTurnDto(
                                    idx,
                                    ex.getSide(),
                                    ex.getModelName(),
                                    ex.getRole(),
                                    ex.getText(),
                                    ex.getTemperature());
                            safeSend(emitter, "turn", turn);
                        });

                DebateApiResponse full = judgeService.toApiResponse(result, style, rounds);
                safeSend(emitter, "complete", full);
                persistenceService.persist(full);
                emitter.complete();
            } catch (Exception e) {
                log.error("Debate stream failed", e);
                try {
                    Map<String, String> err = new HashMap<String, String>();
                    err.put("message", e.getMessage() != null ? e.getMessage() : "Debate failed");
                    emitter.send(SseEmitter.event().name("error").data(err));
                } catch (IOException ioe) {
                    log.debug("Could not send error SSE event", ioe);
                }
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private static void safeSend(SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
