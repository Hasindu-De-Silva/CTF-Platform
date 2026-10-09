package com.ctfplaybox.service;

import com.ctfplaybox.dto.ChallengeDtos.AdminChallengeRequest;
import com.ctfplaybox.dto.ChallengeDtos.ChallengeResponse;
import com.ctfplaybox.dto.ChallengeDtos.HintDto;
import com.ctfplaybox.dto.ChallengeDtos.SubmitFlagResponse;
import com.ctfplaybox.dto.ChallengeDtos.UnlockHintResponse;
import com.ctfplaybox.dto.ScoreboardEntry;
import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.HintUnlock;
import com.ctfplaybox.model.Submission;
import com.ctfplaybox.model.User;
import com.ctfplaybox.repository.ChallengeRepository;
import com.ctfplaybox.repository.HintUnlockRepository;
import com.ctfplaybox.repository.SubmissionRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final SubmissionRepository submissionRepository;
    private final HintUnlockRepository hintUnlockRepository;
    private final PasswordEncoder passwordEncoder;

    public ChallengeService(ChallengeRepository challengeRepository,
                          SubmissionRepository submissionRepository,
                          HintUnlockRepository hintUnlockRepository,
                          PasswordEncoder passwordEncoder) {
        this.challengeRepository = challengeRepository;
        this.submissionRepository = submissionRepository;
        this.hintUnlockRepository = hintUnlockRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static int getHintPenalty(int points, int tier) {
        int t1 = (int) Math.round(points * 0.10);
        int t2 = (int) Math.round(points * 0.15);
        int maxPenalty = points / 2; // Total penalty capped at exactly 50% across all 3 tiers
        return switch (tier) {
            case 1 -> t1;
            case 2 -> t2;
            case 3 -> Math.max(0, maxPenalty - (t1 + t2));
            default -> 0;
        };
    }

    public List<ChallengeResponse> listForPlayer(User user) {
        return challengeRepository.findByActiveTrueOrderByStageOrderAsc().stream()
                .map(c -> toResponse(c, user))
                .collect(Collectors.toList());
    }

    public ChallengeResponse getOneForPlayer(Long id, User user) {
        Challenge c = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        return toResponse(c, user);
    }

    private ChallengeResponse toResponse(Challenge c, User user) {
        boolean solved = user != null && submissionRepository.existsByUserAndChallengeAndCorrectTrue(user, c);
        List<HintUnlock> unlocks = (user != null)
                ? hintUnlockRepository.findByUserAndChallenge(user, c)
                : Collections.emptyList();

        Map<Integer, HintUnlock> unlockMap = unlocks.stream()
                .collect(Collectors.toMap(HintUnlock::getTier, h -> h, (a, b) -> a));

        List<HintDto> hints = new ArrayList<>();
        for (int tier = 1; tier <= 3; tier++) {
            String hintText = getHintText(c, tier);
            if (hintText != null && !hintText.isBlank()) {
                boolean isUnlocked = unlockMap.containsKey(tier);
                int penalty = getHintPenalty(c.getPoints(), tier);
                hints.add(new HintDto(tier, penalty, isUnlocked, isUnlocked ? hintText : null));
            }
        }

        int penaltyDeducted = unlocks.stream().mapToInt(HintUnlock::getPenaltyPoints).sum();

        return new ChallengeResponse(
                c.getId(), c.getStageOrder(), c.getTitle(), c.getDomain(), c.getDifficulty(),
                c.getDescription(), c.getHint(), hints, penaltyDeducted, c.getPoints(), solved,
                c.getArtifactUrl(), c.getTargetUrl()
        );
    }

    private String getHintText(Challenge c, int tier) {
        return switch (tier) {
            case 1 -> (c.getHint1() != null && !c.getHint1().isBlank()) ? c.getHint1() : c.getHint();
            case 2 -> c.getHint2();
            case 3 -> c.getHint3();
            default -> null;
        };
    }

    @Transactional
    public UnlockHintResponse unlockHint(Long challengeId, int tier, User user) {
        if (tier < 1 || tier > 3) {
            return new UnlockHintResponse(false, tier, 0, null, "Invalid hint tier. Must be between 1 and 3.");
        }

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        String text = getHintText(challenge, tier);
        if (text == null || text.isBlank()) {
            return new UnlockHintResponse(false, tier, 0, null, "No hint available for tier " + tier);
        }

        Optional<HintUnlock> existing = hintUnlockRepository.findByUserAndChallengeAndTier(user, challenge, tier);
        if (existing.isPresent()) {
            return new UnlockHintResponse(true, tier, existing.get().getPenaltyPoints(), text, "Hint already unlocked");
        }

        int penalty = getHintPenalty(challenge.getPoints(), tier);
        HintUnlock unlock = new HintUnlock();
        unlock.setUser(user);
        unlock.setChallenge(challenge);
        unlock.setTier(tier);
        unlock.setPenaltyPoints(penalty);
        unlock.setUnlockedAt(LocalDateTime.now());
        hintUnlockRepository.save(unlock);

        return new UnlockHintResponse(true, tier, penalty, text,
                "Tier " + tier + " hint unlocked! -" + penalty + " points penalty applied.");
    }

    @Transactional
    public SubmitFlagResponse submitFlag(Long challengeId, User user, String submittedFlag) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        boolean alreadySolved = submissionRepository.existsByUserAndChallengeAndCorrectTrue(user, challenge);
        if (alreadySolved) {
            return new SubmitFlagResponse(true, "Already solved - points already awarded", 0);
        }

        // Anti-spam rate limiting: 2-second cooldown between attempts
        Optional<Submission> lastSub = submissionRepository.findTopByUserAndChallengeOrderBySubmittedAtDesc(user, challenge);
        if (lastSub.isPresent() && lastSub.get().getSubmittedAt().isAfter(LocalDateTime.now().minusSeconds(2))) {
            return new SubmitFlagResponse(false, "Rate limit: Please wait 2 seconds between attempts.", 0);
        }

        // Anti-brute-force rate limiting: maximum 5 failed attempts per minute per challenge
        long recentFailures = submissionRepository.countByUserAndChallengeAndCorrectFalseAndSubmittedAtAfter(
                user, challenge, LocalDateTime.now().minusSeconds(60)
        );
        if (recentFailures >= 5) {
            return new SubmitFlagResponse(false, "Too many failed attempts! Cooldown active for 60 seconds.", 0);
        }

        boolean correct = passwordEncoder.matches(submittedFlag, challenge.getFlagHash());

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setChallenge(challenge);
        submission.setSubmittedFlag(submittedFlag);
        submission.setCorrect(correct);
        submissionRepository.save(submission);

        if (correct) {
            int penalties = hintUnlockRepository.findByUserAndChallenge(user, challenge).stream()
                    .mapToInt(HintUnlock::getPenaltyPoints)
                    .sum();
            int minScore = challenge.getPoints() / 2;
            int netPoints = Math.max(minScore, challenge.getPoints() - penalties);
            String msg = penalties > 0
                    ? "Correct flag! Awarded " + netPoints + " points (deducted " + penalties + " pts hint penalty)."
                    : "Correct flag! Full points awarded.";
            return new SubmitFlagResponse(true, msg, netPoints);
        }
        return new SubmitFlagResponse(false, "Incorrect flag, try again", 0);
    }

    @Transactional
    public ChallengeResponse resetChallengeForUser(Long challengeId, User user) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        hintUnlockRepository.deleteByUserAndChallenge(user, challenge);
        submissionRepository.deleteByUserAndChallenge(user, challenge);

        return toResponse(challenge, user);
    }

    // ---- Admin operations ----

    public List<Challenge> listAllForAdmin() {
        return challengeRepository.findAllByOrderByStageOrderAsc();
    }

    public Challenge createChallenge(AdminChallengeRequest req) {
        Challenge c = new Challenge();
        applyRequest(c, req);
        return challengeRepository.save(c);
    }

    public Challenge updateChallenge(Long id, AdminChallengeRequest req) {
        Challenge c = challengeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        applyRequest(c, req);
        return challengeRepository.save(c);
    }

    public void deleteChallenge(Long id) {
        challengeRepository.deleteById(id);
    }

    private void applyRequest(Challenge c, AdminChallengeRequest req) {
        c.setStageOrder(req.getStageOrder());
        c.setTitle(req.getTitle());
        c.setDomain(req.getDomain());
        c.setDifficulty(req.getDifficulty());
        c.setDescription(req.getDescription());
        c.setHint(req.getHint());
        c.setHint1(req.getHint1() != null ? req.getHint1() : req.getHint());
        c.setHint2(req.getHint2());
        c.setHint3(req.getHint3());
        c.setPoints(req.getPoints());
        c.setArtifactUrl(req.getArtifactUrl());
        c.setTargetUrl(req.getTargetUrl());
        c.setActive(req.getActive() == null ? true : req.getActive());
        // Only re-hash if a new flag value was actually provided
        if (req.getFlag() != null && !req.getFlag().isBlank()) {
            c.setFlagHash(passwordEncoder.encode(req.getFlag()));
        }
    }

    // ---- Scoreboard ----

    public List<ScoreboardEntry> getScoreboard() {
        List<Submission> allCorrect = submissionRepository.findAllByOrderBySubmittedAtDesc().stream()
                .filter(Submission::isCorrect)
                .toList();

        Map<String, List<Submission>> byUser = allCorrect.stream()
                .collect(Collectors.groupingBy(s -> s.getUser().getUsername()));

        Map<String, Map<Long, Integer>> penaltiesByUserAndChallenge = hintUnlockRepository.findAll().stream()
                .filter(h -> h.getUser() != null && h.getChallenge() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getUser().getUsername(),
                        Collectors.groupingBy(
                                h -> h.getChallenge().getId(),
                                Collectors.summingInt(HintUnlock::getPenaltyPoints)
                        )
                ));

        Set<String> allUsernames = new HashSet<>();
        allUsernames.addAll(byUser.keySet());
        allUsernames.addAll(penaltiesByUserAndChallenge.keySet());

        return allUsernames.stream()
                .map(username -> {
                    List<Submission> userSubs = byUser.getOrDefault(username, Collections.emptyList());
                    Map<Long, Integer> userPenalties = penaltiesByUserAndChallenge.getOrDefault(username, Collections.emptyMap());
                    long net = userSubs.stream().mapToLong(s -> {
                        int challengePoints = s.getChallenge().getPoints();
                        int challengePenalties = userPenalties.getOrDefault(s.getChallenge().getId(), 0);
                        int minScore = challengePoints / 2;
                        return Math.max(minScore, challengePoints - challengePenalties);
                    }).sum();
                    return new ScoreboardEntry(username, net, userSubs.size());
                })
                .sorted(Comparator.comparingLong(ScoreboardEntry::getTotalPoints).reversed()
                        .thenComparingLong(ScoreboardEntry::getSolvedCount).reversed())
                .collect(Collectors.toList());
    }
}
