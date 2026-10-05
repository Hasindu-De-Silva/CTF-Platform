package com.ctfplaybox.dto;

public class ScoreboardEntry {
    private String username;
    private long totalPoints;
    private long solvedCount;

    public ScoreboardEntry() {}

    public ScoreboardEntry(String username, long totalPoints, long solvedCount) {
        this.username = username;
        this.totalPoints = totalPoints;
        this.solvedCount = solvedCount;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public long getTotalPoints() { return totalPoints; }
    public void setTotalPoints(long totalPoints) { this.totalPoints = totalPoints; }

    public long getSolvedCount() { return solvedCount; }
    public void setSolvedCount(long solvedCount) { this.solvedCount = solvedCount; }
}
