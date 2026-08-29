package com.jonathanspereira.condoflow.health;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/saude")
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Map<String, String>> checkHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("api", "UP");

        try {
            jdbcTemplate.execute("SELECT 1");
            status.put("database", "UP");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            status.put("database", "DOWN");
            status.put("error", e.getMessage());
            return ResponseEntity.status(503).body(status);
        }
    }
}
