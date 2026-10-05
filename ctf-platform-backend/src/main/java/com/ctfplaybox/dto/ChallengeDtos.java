package com.ctfplaybox.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ChallengeDtos {

    public static class HintDto {
        private Integer tier;
        private Integer penalty;
        private boolean unlocked;
        private String text;

        public HintDto() {}

        public HintDto(Integer tier, Integer penalty, boolean unlocked, String text) {
            this.tier = tier;
            this.penalty = penalty;
            this.unlocked = unlocked;
            this.text = text;
        }

        public Integer getTier() { return tier; }
        public void setTier(Integer tier) { this.tier = tier; }

        public Integer getPenalty() { return penalty; }
        public void setPenalty(Integer penalty) { this.penalty = penalty; }

        public boolean isUnlocked() { return unlocked; }
        public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class UnlockHintResponse {
        private boolean success;
        private Integer tier;
        private Integer penaltyDeducted;
        private String hintText;
        private String message;

        public UnlockHintResponse() {}

        public UnlockHintResponse(boolean success, Integer tier, Integer penaltyDeducted, String hintText, String message) {
            this.success = success;
            this.tier = tier;
            this.penaltyDeducted = penaltyDeducted;
            this.hintText = hintText;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public Integer getTier() { return tier; }
        public void setTier(Integer tier) { this.tier = tier; }

        public Integer getPenaltyDeducted() { return penaltyDeducted; }
        public void setPenaltyDeducted(Integer penaltyDeducted) { this.penaltyDeducted = penaltyDeducted; }

        public String getHintText() { return hintText; }
        public void setHintText(String hintText) { this.hintText = hintText; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    // What players see - never includes the flag or its hash
    public static class ChallengeResponse {
        private Long id;
        private Integer stageOrder;
        private String title;
        private String domain;
        private String difficulty;
        private String description;
        private String hint;
        private List<HintDto> hints;
        private Integer penaltyDeducted;
        private Integer points;
        private boolean solved;
        private String artifactUrl;
        private String targetUrl;

        public ChallengeResponse() {}

        public ChallengeResponse(Long id, Integer stageOrder, String title, String domain, String difficulty,
                                 String description, String hint, List<HintDto> hints, Integer penaltyDeducted,
                                 Integer points, boolean solved, String artifactUrl, String targetUrl) {
            this.id = id;
            this.stageOrder = stageOrder;
            this.title = title;
            this.domain = domain;
            this.difficulty = difficulty;
            this.description = description;
            this.hint = hint;
            this.hints = hints;
            this.penaltyDeducted = penaltyDeducted;
            this.points = points;
            this.solved = solved;
            this.artifactUrl = artifactUrl;
            this.targetUrl = targetUrl;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Integer getStageOrder() { return stageOrder; }
        public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDomain() { return domain; }
        public void setDomain(String domain) { this.domain = domain; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getHint() { return hint; }
        public void setHint(String hint) { this.hint = hint; }

        public List<HintDto> getHints() { return hints; }
        public void setHints(List<HintDto> hints) { this.hints = hints; }

        public Integer getPenaltyDeducted() { return penaltyDeducted; }
        public void setPenaltyDeducted(Integer penaltyDeducted) { this.penaltyDeducted = penaltyDeducted; }

        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }

        public boolean isSolved() { return solved; }
        public void setSolved(boolean solved) { this.solved = solved; }

        public String getArtifactUrl() { return artifactUrl; }
        public void setArtifactUrl(String artifactUrl) { this.artifactUrl = artifactUrl; }

        public String getTargetUrl() { return targetUrl; }
        public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }
    }

    public static class SubmitFlagRequest {
        @NotBlank
        private String flag;

        public SubmitFlagRequest() {}

        public SubmitFlagRequest(String flag) {
            this.flag = flag;
        }

        public String getFlag() { return flag; }
        public void setFlag(String flag) { this.flag = flag; }
    }

    public static class SubmitFlagResponse {
        private boolean correct;
        private String message;
        private Integer pointsAwarded;

        public SubmitFlagResponse() {}

        public SubmitFlagResponse(boolean correct, String message, Integer pointsAwarded) {
            this.correct = correct;
            this.message = message;
            this.pointsAwarded = pointsAwarded;
        }

        public boolean isCorrect() { return correct; }
        public void setCorrect(boolean correct) { this.correct = correct; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Integer getPointsAwarded() { return pointsAwarded; }
        public void setPointsAwarded(Integer pointsAwarded) { this.pointsAwarded = pointsAwarded; }
    }

    // Used by admins to create/update a challenge
    public static class AdminChallengeRequest {
        @NotNull
        private Integer stageOrder;
        @NotBlank
        private String title;
        @NotBlank
        private String domain;
        @NotBlank
        private String difficulty;
        private String description;
        private String hint;
        private String hint1;
        private String hint2;
        private String hint3;
        @NotNull
        private Integer points;
        @NotBlank
        private String flag;
        private String artifactUrl;
        private String targetUrl;
        private Boolean active = true;

        public AdminChallengeRequest() {}

        public Integer getStageOrder() { return stageOrder; }
        public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDomain() { return domain; }
        public void setDomain(String domain) { this.domain = domain; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getHint() { return hint; }
        public void setHint(String hint) { this.hint = hint; }

        public String getHint1() { return hint1; }
        public void setHint1(String hint1) { this.hint1 = hint1; }

        public String getHint2() { return hint2; }
        public void setHint2(String hint2) { this.hint2 = hint2; }

        public String getHint3() { return hint3; }
        public void setHint3(String hint3) { this.hint3 = hint3; }

        public Integer getPoints() { return points; }
        public void setPoints(Integer points) { this.points = points; }

        public String getFlag() { return flag; }
        public void setFlag(String flag) { this.flag = flag; }

        public String getArtifactUrl() { return artifactUrl; }
        public void setArtifactUrl(String artifactUrl) { this.artifactUrl = artifactUrl; }

        public String getTargetUrl() { return targetUrl; }
        public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}
