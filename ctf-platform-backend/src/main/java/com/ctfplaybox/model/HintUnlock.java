package com.ctfplaybox.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hint_unlocks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "challenge_id", "tier"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HintUnlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @Column(nullable = false)
    private Integer tier; // 1, 2, or 3

    @Column(nullable = false)
    private Integer penaltyPoints;

    @Column(nullable = false)
    private LocalDateTime unlockedAt = LocalDateTime.now();

    public HintUnlock() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Challenge getChallenge() { return challenge; }
    public void setChallenge(Challenge challenge) { this.challenge = challenge; }

    public Integer getTier() { return tier; }
    public void setTier(Integer tier) { this.tier = tier; }

    public Integer getPenaltyPoints() { return penaltyPoints; }
    public void setPenaltyPoints(Integer penaltyPoints) { this.penaltyPoints = penaltyPoints; }

    public LocalDateTime getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; }
}
