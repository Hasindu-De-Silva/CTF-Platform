package com.ctfplaybox.repository;

import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.Submission;
import com.ctfplaybox.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUser(User user);
    Optional<Submission> findFirstByUserAndChallengeAndCorrectTrue(User user, Challenge challenge);
    boolean existsByUserAndChallengeAndCorrectTrue(User user, Challenge challenge);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user", "challenge"})
    List<Submission> findAllByOrderBySubmittedAtDesc();
    void deleteByUser(User user);
    Optional<Submission> findTopByUserAndChallengeOrderBySubmittedAtDesc(User user, Challenge challenge);
    long countByUserAndChallengeAndCorrectFalseAndSubmittedAtAfter(User user, Challenge challenge, LocalDateTime after);
    void deleteByUserAndChallenge(User user, Challenge challenge);
    List<Submission> findByUserAndChallenge(User user, Challenge challenge);
}

