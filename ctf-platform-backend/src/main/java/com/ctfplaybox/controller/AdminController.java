package com.ctfplaybox.controller;

import com.ctfplaybox.dto.AuthDtos.AdminUserResponse;
import com.ctfplaybox.dto.ChallengeDtos.AdminChallengeRequest;
import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.Submission;
import com.ctfplaybox.repository.SubmissionRepository;
import com.ctfplaybox.service.ChallengeService;
import com.ctfplaybox.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// All routes here are restricted to ROLE_ADMIN by SecurityConfig ("/api/admin/**")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ChallengeService challengeService;
    private final UserService userService;
    private final SubmissionRepository submissionRepository;

    public AdminController(ChallengeService challengeService, UserService userService, SubmissionRepository submissionRepository) {
        this.challengeService = challengeService;
        this.userService = userService;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping("/challenges")
    public ResponseEntity<List<Challenge>> listAll() {
        return ResponseEntity.ok(challengeService.listAllForAdmin());
    }

    @PostMapping("/challenges")
    public ResponseEntity<Challenge> create(@Valid @RequestBody AdminChallengeRequest req) {
        return ResponseEntity.ok(challengeService.createChallenge(req));
    }

    @PutMapping("/challenges/{id}")
    public ResponseEntity<Challenge> update(@PathVariable Long id, @Valid @RequestBody AdminChallengeRequest req) {
        return ResponseEntity.ok(challengeService.updateChallenge(id, req));
    }

    @DeleteMapping("/challenges/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        challengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/submissions")
    public ResponseEntity<List<Submission>> submissions() {
        return ResponseEntity.ok(submissionRepository.findAllByOrderBySubmittedAtDesc());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> listUsers() {
        return ResponseEntity.ok(userService.listAllUsersForAdmin());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        userService.deleteUser(id, authentication != null ? authentication.getName() : "");
        return ResponseEntity.noContent().build();
    }
}
