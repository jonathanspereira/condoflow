package com.jonathanspereira.condoflow.common.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigrationService.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void runMigrations() {
        try {
            log.info("Checking and running manual schema migrations...");
            // Alterar o tipo da coluna person_photo_url para TEXT, pois o ddl-auto=update do Hibernate
            // não consegue converter VARCHAR(255) para TEXT automaticamente em bancos existentes.
            jdbcTemplate.execute("ALTER TABLE access_authorizations ALTER COLUMN person_photo_url TYPE TEXT;");
            log.info("Migration successful: access_authorizations.person_photo_url is now TEXT.");
        } catch (Exception e) {
            log.warn("Migration skipped or failed (might already be TEXT or table doesn't exist): {}", e.getMessage());
        }
    }
}
