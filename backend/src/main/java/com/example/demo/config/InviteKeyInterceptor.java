package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashSet;
import java.util.Set;

@Component
public class InviteKeyInterceptor implements HandlerInterceptor {

    @Value("${app.invite.required:false}")
    private boolean required;

    @Value("${app.invite.keys:}")
    private String rawKeys;

    private Set<String> parseKeys() {
        Set<String> out = new HashSet<>();
        if (rawKeys == null) return out;
        String[] parts = rawKeys.split(",");
        for (int i = 0; i < parts.length; i++) {
            String t = parts[i] != null ? parts[i].trim() : "";
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!required) return true;
        Set<String> keys = parseKeys();
        if (keys.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invite keys are not configured.");
        }
        String provided = request.getHeader("X-Invite-Key");
        if (provided == null) provided = request.getHeader("x-invite-key");
        if (provided == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invitation key required.");
        }
        String t = provided.trim();
        if (!keys.contains(t)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid invitation key.");
        }
        return true;
    }
}

