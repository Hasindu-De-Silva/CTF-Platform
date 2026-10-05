package com.ctfplaybox.repository;

import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.HintUnlock;
import com.ctfplaybox.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HintUnlockRepository extends JpaRepository<HintUnlock, Long> {
    List<HintUnlock> findByUser(User user);
    List<HintUnlock> findByUserAndChallenge(User user, Challenge challenge);
    Optional<HintUnlock> findByUserAndChallengeAndTier(User user, Challenge challenge, Integer tier);
    boolean existsByUserAndChallengeAndTier(User user, Challenge challenge, Integer tier);
}
