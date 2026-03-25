package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

/**
 * Emits a single high-signal line at boot so we can see if JPA repositories were created.
 * This helps debug Railway env vars that may disable JDBC/JPA auto-config.
 */
@Component
public class JpaStartupDiagnostics implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(JpaStartupDiagnostics.class);

    private final ApplicationContext ctx;

    public JpaStartupDiagnostics(ApplicationContext ctx) {
        this.ctx = ctx;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean hasRepo = false;
        try {
            Class<?> repoClass = Class.forName("com.tiramisu.entity.DebateRecordRepository");
            hasRepo = ctx.getBeanNamesForType(repoClass).length > 0;
        } catch (Exception ignored) {
            hasRepo = false;
        }

        log.info("JPA diagnostics: hasDebateRecordRepository={} spring.autoconfigure.exclude={} spring.data.jpa.repositories.enabled={}",
                hasRepo,
                System.getProperty("spring.autoconfigure.exclude"),
                System.getProperty("spring.data.jpa.repositories.enabled"));
    }
}

