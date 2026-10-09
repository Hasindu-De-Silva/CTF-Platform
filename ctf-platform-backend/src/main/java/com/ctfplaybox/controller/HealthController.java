package com.ctfplaybox.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lightweight, unauthenticated liveness endpoint.
 *
 * <p>Purely additive: it introduces no new state and touches no existing route.
 * Docker Compose / CI pipelines can poll {@code GET /api/health} to confirm the
 * API is up without needing a session. Returns {@code 200 OK} with a small JSON
 * status document.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("service", "ctf-platform-backend");
        body.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(body);
    }
}
