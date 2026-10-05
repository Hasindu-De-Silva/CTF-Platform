package com.ctfplaybox.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;

        public LoginRequest() {}

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;

        public RegisterRequest() {}

        public RegisterRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UserResponse {
        private String username;
        private String role;

        public UserResponse() {}

        public UserResponse(String username, String role) {
            this.username = username;
            this.role = role;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class AdminUserResponse {
        private Long id;
        private String username;
        private String role;
        private long totalScore;
        private long solvedCount;
        private long submissionCount;

        public AdminUserResponse() {}

        public AdminUserResponse(Long id, String username, String role, long totalScore, long solvedCount, long submissionCount) {
            this.id = id;
            this.username = username;
            this.role = role;
            this.totalScore = totalScore;
            this.solvedCount = solvedCount;
            this.submissionCount = submissionCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public long getTotalScore() { return totalScore; }
        public void setTotalScore(long totalScore) { this.totalScore = totalScore; }

        public long getSolvedCount() { return solvedCount; }
        public void setSolvedCount(long solvedCount) { this.solvedCount = solvedCount; }

        public long getSubmissionCount() { return submissionCount; }
        public void setSubmissionCount(long submissionCount) { this.submissionCount = submissionCount; }
    }
}
