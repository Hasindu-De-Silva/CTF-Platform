package com.ctfplaybox.service;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Pins the scoring rules documented in the README
 * ("Progressive Hints & Point Penalty Structure").
 */
class ScoringRulesTest {

    @ParameterizedTest(name = "{0} pts -> tier penalties {1} / {2} / {3}")
    @CsvSource({
            "100, 10, 15, 25",
            "150, 15, 23, 37",
            "200, 20, 30, 50",
            "250, 25, 38, 62",
            "300, 30, 45, 75",
    })
    void penaltiesMatchReadmeTable(int points, int tier1, int tier2, int tier3) {
        assertEquals(tier1, ChallengeService.getHintPenalty(points, 1));
        assertEquals(tier2, ChallengeService.getHintPenalty(points, 2));
        assertEquals(tier3, ChallengeService.getHintPenalty(points, 3));
    }

    @ParameterizedTest
    @ValueSource(ints = {100, 150, 200, 250, 300})
    void allThreeTiersTogetherCostExactlyHalfThePoints(int points) {
        int total = ChallengeService.getHintPenalty(points, 1)
                + ChallengeService.getHintPenalty(points, 2)
                + ChallengeService.getHintPenalty(points, 3);
        assertEquals(points / 2, total);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 4, -1})
    void unknownTierHasNoPenalty(int tier) {
        assertEquals(0, ChallengeService.getHintPenalty(100, tier));
    }

    @ParameterizedTest(name = "{0} pts - {1} penalty -> {2} awarded")
    @CsvSource({
            "100,   0, 100",
            "150,  38, 112",
            "150,  75,  75",
            "150, 200,  75", // never below half the points
            "250,  25, 225",
            "101,  90,  50", // half is rounded down
    })
    void netPointsDeductPenaltiesDownToHalfThePoints(int points, int penalties, int expected) {
        assertEquals(expected, ChallengeService.netPoints(points, penalties));
    }
}
