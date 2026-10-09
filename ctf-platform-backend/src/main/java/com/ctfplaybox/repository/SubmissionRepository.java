package com.ctfplaybox.repository;

import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.Submission;
import com.ctfplaybox.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    boolean existsByUserAndChallengeAndCorrectTrue(User user, Challenge challenge);
    @EntityGraph(attributePaths = {"user", "challenge"})
    List<Submission> findAllByOrderBySubmittedAtDesc();
    void deleteByUser(User user);
    Optional<Submission> findTopByUserAndChallengeOrderBySubmittedAtDesc(User user, Challenge challenge);
    long countByUserAndChallengeAndCorrectFalseAndSubmittedAtAfter(User user, Challenge challenge, LocalDateTime after);
    void deleteByUserAndChallenge(User user, Challenge challenge);
}
