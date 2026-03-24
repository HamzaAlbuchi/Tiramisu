package com.example.demo.debate;

import com.example.demo.debate.api.DebateApiRequest;
import com.example.demo.debate.api.DebateApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debate")
public class DebateApiController {

    private final DebateService debateService;
    private final JudgeService judgeService;

    public DebateApiController(DebateService debateService, JudgeService judgeService) {
        this.debateService = debateService;
        this.judgeService = judgeService;
    }

    @PostMapping
    public DebateApiResponse run(@RequestBody(required = false) DebateApiRequest request) {
        if (request == null) {
            request = new DebateApiRequest();
        }
        int rounds = request.getRounds();
        String style = request.getStyle() != null ? request.getStyle() : "balanced";
        DebateResult result = debateService.runDebateWithRounds(request.getTopic(), rounds, style);
        return judgeService.toApiResponse(result, style, rounds);
    }
}
