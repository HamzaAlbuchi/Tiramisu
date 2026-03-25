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
import java.net.URLDecoder;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    /**
     * Railway Postgres commonly requires SSL. Override via env if needed (e.g. "verify-full" or "disable").
     */
    @Value("${DATABASE_SSLMODE:require}")
    private String sslMode;

    @Bean
    public DataSource dataSource() {
        if (databaseUrl == null || databaseUrl.trim().isEmpty()) {
            log.warn("DATABASE_URL is empty; using Spring default datasource config.");
            // No DB configured; keep the app bootable (debates still work).
            return new HikariDataSource();
        }

        // Work around some managed-Postgres TLS 1.3 key-share negotiation failures by preferring TLS 1.2.
        // This is safe for most platforms and avoids "no suitable key share" errors observed on Railway.
        setTlsSystemPropsIfMissing();

        String raw = databaseUrl.trim();
        if (raw.startsWith("jdbc:")) {
            HikariConfig cfg = new HikariConfig();
            cfg.setJdbcUrl(raw);
            return new HikariDataSource(cfg);
        }

        // Railway provides: postgresql://user:password@host:port/dbname
        // Spring needs: jdbc:postgresql://host:port/dbname (and credentials separately)
        ParsedDb parsed;
        try {
            parsed = parseDatabaseUrl(raw);
        } catch (Exception e) {
            // Do not crash the whole service if the URL is malformed — persistence/stats can be disabled,
            // but debate generation should still run.
            log.error("Failed to parse DATABASE_URL (persistence disabled): {}", e.getMessage());
            return new HikariDataSource();
        }

        HikariConfig cfg = new HikariConfig();
        cfg.setDriverClassName("org.postgresql.Driver");
        cfg.setJdbcUrl(ensureSslMode(parsed.jdbcUrl, sslMode));
        if (parsed.username != null && !parsed.username.trim().isEmpty()) {
            cfg.setUsername(parsed.username);
        }
        if (parsed.password != null && !parsed.password.trim().isEmpty()) {
            cfg.setPassword(parsed.password);
        }
        // Some managed Postgres endpoints require explicit SSL flag in addition to sslmode.
        cfg.addDataSourceProperty("ssl", "true");
        cfg.addDataSourceProperty("sslmode", (sslMode == null || sslMode.trim().isEmpty()) ? "require" : sslMode.trim());

        // Keep pool conservative by default; Railway plans vary.
        cfg.setMaximumPoolSize(5);
        cfg.setMinimumIdle(1);
        cfg.setConnectionTimeout(5000);
        cfg.setValidationTimeout(3000);
        // Never fail the whole app on DB init; stats/persistence are best-effort.
        cfg.setInitializationFailTimeout(-1);

        log.info("Configured Postgres datasource: {}", redactJdbc(cfg.getJdbcUrl()));
        return new HikariDataSource(cfg);
    }

    private static void setTlsSystemPropsIfMissing() {
        // Force TLSv1.2 if user didn't override it.
        if (System.getProperty("jdk.tls.client.protocols") == null) {
            System.setProperty("jdk.tls.client.protocols", "TLSv1.2");
        }
        // Ensure at least common groups are offered (helps on some JSSE/provider combos).
        if (System.getProperty("jdk.tls.namedGroups") == null) {
            System.setProperty("jdk.tls.namedGroups", "x25519,secp256r1,secp384r1,secp521r1");
        }
    }

    private static String ensureSslMode(String jdbcUrl, String sslMode) {
        if (jdbcUrl == null) {
            return null;
        }
        String mode = (sslMode == null || sslMode.trim().isEmpty()) ? "require" : sslMode.trim();
        String lower = jdbcUrl.toLowerCase();
        if (lower.contains("sslmode=")) {
            return jdbcUrl;
        }
        if (jdbcUrl.contains("?")) {
            return jdbcUrl + "&sslmode=" + mode;
        }
        return jdbcUrl + "?sslmode=" + mode;
    }

    private static ParsedDb parseDatabaseUrl(String raw) throws Exception {
        // First attempt: java.net.URI (works when userinfo is properly URL-encoded).
        try {
            URI uri = new URI(raw);
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
            return new ParsedDb(jdbcUrl, urlDecode(user), urlDecode(pass));
        } catch (URISyntaxException ignored) {
            // fall through to manual parse
        }

        // Manual fallback: tolerate unescaped characters in password by splitting on the last '@'.
        String s = raw;
        if (s.startsWith("postgresql://")) {
            s = s.substring("postgresql://".length());
        } else if (s.startsWith("postgres://")) {
            s = s.substring("postgres://".length());
        } else {
            throw new IllegalStateException("Unsupported DATABASE_URL format");
        }

        int at = s.lastIndexOf('@');
        if (at < 0) {
            throw new IllegalStateException("DATABASE_URL missing '@' delimiter");
        }
        String creds = s.substring(0, at);
        String hostPart = s.substring(at + 1);

        String user = null;
        String pass = null;
        int colon = creds.indexOf(':');
        if (colon >= 0) {
            user = creds.substring(0, colon);
            pass = creds.substring(colon + 1);
        } else {
            user = creds;
        }

        int slash = hostPart.indexOf('/');
        if (slash < 0) {
            throw new IllegalStateException("DATABASE_URL missing dbname path");
        }
        String hostPort = hostPart.substring(0, slash);
        String dbPlus = hostPart.substring(slash + 1);
        String db = dbPlus;
        int q = dbPlus.indexOf('?');
        if (q >= 0) {
            db = dbPlus.substring(0, q);
        }

        String host = hostPort;
        int port = 5432;
        int pidx = hostPort.lastIndexOf(':');
        if (pidx >= 0) {
            host = hostPort.substring(0, pidx);
            try {
                port = Integer.parseInt(hostPort.substring(pidx + 1));
            } catch (Exception ignored) {
                port = 5432;
            }
        }

        if (host.trim().isEmpty() || db.trim().isEmpty()) {
            throw new IllegalStateException("DATABASE_URL missing host or dbname");
        }
        String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, db);
        return new ParsedDb(jdbcUrl, urlDecode(user), urlDecode(pass));
    }

    private static String urlDecode(String s) {
        if (s == null) {
            return null;
        }
        try {
            return URLDecoder.decode(s, "UTF-8");
        } catch (Exception e) {
            return s;
        }
    }

    private static final class ParsedDb {
        final String jdbcUrl;
        final String username;
        final String password;

        ParsedDb(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }
    }

    private static String redactJdbc(String jdbcUrl) {
        if (jdbcUrl == null) {
            return "";
        }
        // No credentials are in jdbcUrl here, but keep consistent redaction.
        return jdbcUrl.replaceAll("(?i)(password=)([^&]+)", "$1***");
    }
}

