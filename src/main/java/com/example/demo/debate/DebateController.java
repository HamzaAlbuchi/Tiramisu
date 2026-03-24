package com.example.demo.debate;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debate")
public class DebateController {

    private final DebateService debateService;

    public DebateController(DebateService debateService) {
        this.debateService = debateService;
    }

    @PostMapping("/run")
    public DebateResult run(@RequestBody DebateRequest request) {
        if (request == null) {
            request = new DebateRequest();
        }
        return debateService.runDebate(request.getTopic(), request.getExchanges());
    }
}
