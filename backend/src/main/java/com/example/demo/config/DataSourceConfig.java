package com.example.demo.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    public DataSource dataSource() {
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            log.warn("DATABASE_URL is empty; using Spring default datasource config.");
            return new HikariDataSource();
        }

        String raw = databaseUrl.trim();
        if (raw.startsWith("jdbc:")) {
            HikariConfig cfg = new HikariConfig();
            cfg.setJdbcUrl(raw);
            return new HikariDataSource(cfg);
        }

        // Railway provides: postgresql://user:password@host:port/dbname
        // Spring needs: jdbc:postgresql://host:port/dbname (and credentials separately)
        URI uri;
        try {
            uri = new URI(raw);
        } catch (URISyntaxException e) {
            throw new IllegalStateException("Invalid DATABASE_URL: " + e.getMessage(), e);
        }

        String scheme = uri.getScheme() != null ? uri.getScheme() : "";
        if (!scheme.toLowerCase().startsWith("postgres")) {
            throw new IllegalStateException("Unsupported DATABASE_URL scheme: " + scheme);
        }

        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath() != null ? uri.getPath() : "";
        String db = path.startsWith("/") ? path.substring(1) : path;

        if (host == null || host.trim().isEmpty() || db.trim().isEmpty()) {
            throw new IllegalStateException("DATABASE_URL missing host or dbname");
        }

        String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, db);

        String user = null;
        String pass = null;
        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.trim().isEmpty()) {
            int idx = userInfo.indexOf(':');
            if (idx >= 0) {
                user = userInfo.substring(0, idx);
                pass = userInfo.substring(idx + 1);
            } else {
                user = userInfo;
            }
        }

        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl(jdbcUrl);
        if (user != null && !user.trim().isEmpty()) {
            cfg.setUsername(user);
        }
        if (pass != null && !pass.trim().isEmpty()) {
            cfg.setPassword(pass);
        }

        // Keep pool conservative by default; Railway plans vary.
        cfg.setMaximumPoolSize(5);
        cfg.setMinimumIdle(1);

        log.info("Configured Postgres datasource: {}", redactJdbc(jdbcUrl));
        return new HikariDataSource(cfg);
    }

    private static String redactJdbc(String jdbcUrl) {
        if (jdbcUrl == null) {
            return "";
        }
        // No credentials are in jdbcUrl here, but keep consistent redaction.
        return jdbcUrl.replaceAll("(?i)(password=)([^&]+)", "$1***");
    }
}

