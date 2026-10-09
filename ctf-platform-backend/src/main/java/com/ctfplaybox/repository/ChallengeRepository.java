package com.ctfplaybox.repository;

import com.ctfplaybox.model.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByActiveTrueOrderByStageOrderAsc();
    List<Challenge> findAllByOrderByStageOrderAsc();
    Optional<Challenge> findFirstByStageOrderOrderByIdAsc(Integer stageOrder);
}
