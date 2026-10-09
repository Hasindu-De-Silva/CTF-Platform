package com.ctfplaybox.repository;

import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.HintUnlock;
import com.ctfplaybox.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HintUnlockRepository extends JpaRepository<HintUnlock, Long> {
    List<HintUnlock> findByUserAndChallenge(User user, Challenge challenge);
    Optional<HintUnlock> findByUserAndChallengeAndTier(User user, Challenge challenge, Integer tier);
    void deleteByUserAndChallenge(User user, Challenge challenge);
    void deleteByUser(User user);
    void deleteByChallenge(Challenge challenge);
}
