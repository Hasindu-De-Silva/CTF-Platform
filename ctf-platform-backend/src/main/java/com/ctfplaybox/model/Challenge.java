package com.ctfplaybox.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "challenges")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer stageOrder;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String domain;

    @Column(nullable = false)
    private String difficulty;

    @Column(length = 2000)
    private String description;

    @Column(length = 1000)
    private String hint;

    @Column(length = 1000)
    private String hint1;

    @Column(length = 1000)
    private String hint2;

    @Column(length = 1000)
    private String hint3;

    @Column(nullable = false)
    private Integer points;

    @JsonIgnore
    @Column(nullable = false)
    private String flagHash;

    @Column(length = 255)
    private String artifactUrl;

    @Column(length = 255)
    private String targetUrl;

    @Column(nullable = false)
    private Boolean active = true;

    public Challenge() {}

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

    public String getHint1() { return hint1; }
    public void setHint1(String hint1) { this.hint1 = hint1; }

    public String getHint2() { return hint2; }
    public void setHint2(String hint2) { this.hint2 = hint2; }

    public String getHint3() { return hint3; }
    public void setHint3(String hint3) { this.hint3 = hint3; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getFlagHash() { return flagHash; }
    public void setFlagHash(String flagHash) { this.flagHash = flagHash; }

    public String getArtifactUrl() { return artifactUrl; }
    public void setArtifactUrl(String artifactUrl) { this.artifactUrl = artifactUrl; }

    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
