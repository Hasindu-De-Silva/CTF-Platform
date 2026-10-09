package com.ctfplaybox.service;

import com.ctfplaybox.dto.AuthDtos.AdminUserResponse;
import com.ctfplaybox.model.HintUnlock;
import com.ctfplaybox.model.Role;
import com.ctfplaybox.model.Submission;
import com.ctfplaybox.model.User;
import com.ctfplaybox.repository.HintUnlockRepository;
import com.ctfplaybox.repository.SubmissionRepository;
import com.ctfplaybox.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final HintUnlockRepository hintUnlockRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, SubmissionRepository submissionRepository,
                       HintUnlockRepository hintUnlockRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.hintUnlockRepository = hintUnlockRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerPlayer(String username, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.PLAYER);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listAllUsersForAdmin() {
        List<User> users = userRepository.findAll();
        List<Submission> allSubmissions = submissionRepository.findAllByOrderBySubmittedAtDesc();

        Map<Long, List<Submission>> submissionsByUserId = allSubmissions.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getId()));

        // userId -> challengeId -> total hint penalty, so the score matches the scoreboard
        Map<Long, Map<Long, Integer>> penaltiesByUserId = hintUnlockRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        h -> h.getUser().getId(),
                        Collectors.groupingBy(h -> h.getChallenge().getId(),
                                Collectors.summingInt(HintUnlock::getPenaltyPoints))));

        return users.stream().map(u -> {
            List<Submission> userSubs = submissionsByUserId.getOrDefault(u.getId(), List.of());
            long submissionCount = userSubs.size();

            // Distinct solved challenges -> their points
            Map<Long, Integer> pointsBySolvedChallenge = userSubs.stream()
                    .filter(Submission::isCorrect)
                    .collect(Collectors.toMap(
                            s -> s.getChallenge().getId(),
                            s -> s.getChallenge().getPoints(),
                            (p1, p2) -> p1
                    ));
            Map<Long, Integer> userPenalties = penaltiesByUserId.getOrDefault(u.getId(), Map.of());

            long solvedCount = pointsBySolvedChallenge.size();
            long totalScore = pointsBySolvedChallenge.entrySet().stream()
                    .mapToLong(e -> ChallengeService.netPoints(e.getValue(), userPenalties.getOrDefault(e.getKey(), 0)))
                    .sum();

            return new AdminUserResponse(
                    u.getId(),
                    u.getUsername(),
                    u.getRole().name(),
                    totalScore,
                    solvedCount,
                    submissionCount
            );
        }).toList();
    }

    @Transactional
    public void deleteUser(Long id, String currentAdminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (user.getUsername().equalsIgnoreCase(currentAdminUsername)) {
            throw new IllegalArgumentException("You cannot delete your own logged-in admin account");
        }

        hintUnlockRepository.deleteByUser(user);
        submissionRepository.deleteByUser(user);
        userRepository.delete(user);
    }
}
