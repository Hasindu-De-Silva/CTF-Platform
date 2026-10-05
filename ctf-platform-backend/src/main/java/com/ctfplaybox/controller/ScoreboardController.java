package com.ctfplaybox.controller;

import com.ctfplaybox.dto.ScoreboardEntry;
import com.ctfplaybox.service.ChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/scoreboard")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*"}, allowCredentials = "true")
public class ScoreboardController {

    private final ChallengeService challengeService;

    public ScoreboardController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping
    public ResponseEntity<List<ScoreboardEntry>> scoreboard() {
        return ResponseEntity.ok(challengeService.getScoreboard());
    }
}
