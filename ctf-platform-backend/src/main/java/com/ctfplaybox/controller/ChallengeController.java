package com.ctfplaybox.controller;

import com.ctfplaybox.dto.ChallengeDtos.ChallengeResponse;
import com.ctfplaybox.dto.ChallengeDtos.SubmitFlagRequest;
import com.ctfplaybox.dto.ChallengeDtos.SubmitFlagResponse;
import com.ctfplaybox.dto.ChallengeDtos.UnlockHintResponse;
import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.User;
import com.ctfplaybox.repository.ChallengeRepository;
import com.ctfplaybox.repository.UserRepository;
import com.ctfplaybox.service.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*", "https://localhost:*", "https://127.0.0.1:*"}, allowCredentials = "true")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;

    public ChallengeController(ChallengeService challengeService, UserRepository userRepository, ChallengeRepository challengeRepository) {
        this.challengeService = challengeService;
        this.userRepository = userRepository;
        this.challengeRepository = challengeRepository;
    }

    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> list(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(challengeService.listForPlayer(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeResponse> getOne(@PathVariable Long id, Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(challengeService.getOneForPlayer(id, user));
    }

    @GetMapping("/{id}/artifact")
    public ResponseEntity<Resource> downloadArtifact(@PathVariable Long id) {
        Challenge c = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        if (c.getArtifactUrl() == null || c.getArtifactUrl().isBlank()) {
            return ResponseEntity.notFound().build();
        }
        String filename = c.getArtifactUrl().substring(c.getArtifactUrl().lastIndexOf('/') + 1);
        Resource resource = new ClassPathResource("static/artifacts/" + filename);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmitFlagResponse> submit(@PathVariable Long id,
                                                       @Valid @RequestBody SubmitFlagRequest req,
                                                       Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(challengeService.submitFlag(id, user, req.getFlag()));
    }

    @PostMapping("/{id}/hints/{tier}")
    public ResponseEntity<UnlockHintResponse> unlockHint(
            @PathVariable Long id,
            @PathVariable Integer tier,
            Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(challengeService.unlockHint(id, tier, user));
    }

    @PostMapping("/{id}/reset")
    public ResponseEntity<ChallengeResponse> resetChallenge(
            @PathVariable Long id,
            Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(challengeService.resetChallengeForUser(id, user));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName()).orElseThrow();
    }
}
