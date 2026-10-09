package com.ctfplaybox;

import com.ctfplaybox.config.DataSeeder;
import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.repository.ChallengeRepository;
import com.ctfplaybox.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end checks of the REST API against the seeded challenge data
 * (in-memory H2 database, full Spring Security filter chain).
 *
 * <p>All test methods share one application context, so each one registers
 * its own uniquely named player and only asserts on that player's data.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PlatformApiIntegrationTest {

    private static final String PASSWORD = "Password123!";
    private static final AtomicInteger PLAYER_SEQ = new AtomicInteger();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DataSeeder dataSeeder;

    // ---------------------------------------------------------------- auth

    @Test
    void registrationLoginAndSessionLifecycle() throws Exception {
        String username = newUsername();

        register(username)
                .andExpect(status().isCreated())
                .andExpect(content().string("Registered successfully - you can now log in"));
        register(username)
                .andExpect(status().isConflict())
                .andExpect(content().string("Username already taken"));

        mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON)
                        .content("{\"username\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));

        mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON).content(credentials(username, "wrong")))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password"));

        MvcResult loginResult = mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                        .content(credentials(username, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("PLAYER"))
                .andReturn();
        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("PLAYER"));
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Not logged in"));

        mvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isOk())
                .andExpect(content().string("Logged out"));
    }

    @Test
    void protectedEndpointsRejectAnonymousAndNonAdminUsers() throws Exception {
        mvc.perform(get("/api/challenges")).andExpect(status().isForbidden());
        mvc.perform(get("/api/scoreboard")).andExpect(status().isForbidden());

        MockHttpSession player = registerAndLogin(newUsername());
        mvc.perform(get("/api/admin/challenges").session(player)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/users").session(player)).andExpect(status().isForbidden());

        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("ctf-platform-backend"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }

    // ---------------------------------------------------------- challenges

    @Test
    void challengeListIsOrderedAndNeverLeaksFlagsOrLockedHints() throws Exception {
        MockHttpSession player = registerAndLogin(newUsername());

        mvc.perform(get("/api/challenges").session(player))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(8)))
                .andExpect(jsonPath("$[0].stageOrder").value(1))
                .andExpect(jsonPath("$[0].title").value("The Public Footprint"))
                .andExpect(jsonPath("$[0].points").value(100))
                .andExpect(jsonPath("$[0].solved").value(false))
                .andExpect(jsonPath("$[0].penaltyDeducted").value(0))
                .andExpect(jsonPath("$[0].targetUrl").value("/stage1-osint"))
                .andExpect(jsonPath("$[0].artifactUrl").value(nullValue()))
                .andExpect(jsonPath("$[0].hints", hasSize(3)))
                .andExpect(jsonPath("$[0].hints[0].tier").value(1))
                .andExpect(jsonPath("$[0].hints[0].penalty").value(10))
                .andExpect(jsonPath("$[0].hints[1].penalty").value(15))
                .andExpect(jsonPath("$[0].hints[2].penalty").value(25))
                .andExpect(jsonPath("$[0].hints[0].unlocked").value(false))
                .andExpect(jsonPath("$[0].hints[0].text").value(nullValue()))
                .andExpect(jsonPath("$[0].hint").doesNotExist())
                .andExpect(jsonPath("$[7].stageOrder").value(8))
                .andExpect(jsonPath("$[7].points").value(300))
                .andExpect(content().string(not(containsString("flagHash"))))
                .andExpect(content().string(not(containsString("CTF{"))))
                .andExpect(content().string(not(containsString("$2a$"))))
                // locked hint text must not be sent at all (stage 3 tier 1, stage 1 legacy hint)
                .andExpect(content().string(not(containsString("Two kinds of scrambling"))))
                .andExpect(content().string(not(containsString("Inspect the public profile markup"))));

        mvc.perform(get("/api/challenges/{id}", challengeId(2)).session(player))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageOrder").value(2))
                .andExpect(jsonPath("$.artifactUrl").value("/artifacts/evidence_badge.png"));

        mvc.perform(get("/api/challenges/{id}", 999_999).session(player))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Challenge not found"));
    }

    @Test
    void hintsUnlockOnceAndChargeTheTierPenalty() throws Exception {
        MockHttpSession player = registerAndLogin(newUsername());
        long stage3 = challengeId(3);

        unlockHint(player, stage3, 1)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tier").value(1))
                .andExpect(jsonPath("$.penaltyDeducted").value(15))
                .andExpect(jsonPath("$.hintText").value("Two kinds of scrambling were applied; peel the outer one first."))
                .andExpect(jsonPath("$.message").value("Tier 1 hint unlocked! -15 points penalty applied."));

        unlockHint(player, stage3, 1)
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.penaltyDeducted").value(15))
                .andExpect(jsonPath("$.message").value("Hint already unlocked"));

        unlockHint(player, stage3, 4)
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.penaltyDeducted").value(0))
                .andExpect(jsonPath("$.message").value("Invalid hint tier. Must be between 1 and 3."));

        mvc.perform(get("/api/challenges/{id}", stage3).session(player))
                .andExpect(jsonPath("$.penaltyDeducted").value(15))
                .andExpect(jsonPath("$.hints[0].unlocked").value(true))
                .andExpect(jsonPath("$.hints[0].text").value(notNullValue()))
                .andExpect(jsonPath("$.hints[1].unlocked").value(false))
                .andExpect(jsonPath("$.hints[1].text").value(nullValue()));
    }

    @Test
    void flagSubmissionAwardsNetPointsAndFeedsScoreboard() throws Exception {
        String username = newUsername();
        MockHttpSession player = registerAndLogin(username);

        submitFlag(player, challengeId(1), "CTF{wrong}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.message").value("Incorrect flag, try again"))
                .andExpect(jsonPath("$.pointsAwarded").value(0));
        submitFlag(player, challengeId(1), "CTF{wrong-again}")
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.message").value("Rate limit: Please wait 2 seconds between attempts."));

        submitFlag(player, challengeId(2), "CTF{m3t4d4t4_r3v34ls_4ll}")
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.message").value("Correct flag! Full points awarded."))
                .andExpect(jsonPath("$.pointsAwarded").value(100));
        submitFlag(player, challengeId(2), "CTF{m3t4d4t4_r3v34ls_4ll}")
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.message").value("Already solved - points already awarded"))
                .andExpect(jsonPath("$.pointsAwarded").value(0));

        // Stage 3 (150 pts) with tiers 1 + 2 unlocked: 150 - (15 + 23) = 112
        unlockHint(player, challengeId(3), 1);
        unlockHint(player, challengeId(3), 2);
        submitFlag(player, challengeId(3), "CTF{c1ph3r_ch41n_d3c0d3d}")
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.message").value("Correct flag! Awarded 112 points (deducted 38 pts hint penalty)."))
                .andExpect(jsonPath("$.pointsAwarded").value(112));

        // Stage 4 (150 pts) with every tier unlocked: never below the 50% floor
        unlockHint(player, challengeId(4), 1);
        unlockHint(player, challengeId(4), 2);
        unlockHint(player, challengeId(4), 3);
        submitFlag(player, challengeId(4), "CTF{sql1_auth_byp4ss_succ3ss}")
                .andExpect(jsonPath("$.pointsAwarded").value(75));

        mvc.perform(get("/api/challenges").session(player))
                .andExpect(jsonPath("$[1].solved").value(true))
                .andExpect(jsonPath("$[2].solved").value(true))
                .andExpect(jsonPath("$[2].penaltyDeducted").value(38))
                .andExpect(jsonPath("$[3].penaltyDeducted").value(75))
                .andExpect(jsonPath("$[4].solved").value(false));

        mvc.perform(get("/api/scoreboard").session(player))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.username == '" + username + "')].totalPoints").value(100 + 112 + 75))
                .andExpect(jsonPath("$[?(@.username == '" + username + "')].solvedCount").value(3));

        // The admin directory reports the same net score as the scoreboard, and every stored
        // attempt (the rate-limited attempt above is rejected before it is stored).
        long userId = userRepository.findByUsername(username).orElseThrow().getId();
        MockHttpSession admin = login("admin", "ChangeMe123!");
        mvc.perform(get("/api/admin/users").session(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + userId + ")].totalScore").value(100 + 112 + 75))
                .andExpect(jsonPath("$[?(@.id == " + userId + ")].solvedCount").value(3))
                .andExpect(jsonPath("$[?(@.id == " + userId + ")].submissionCount").value(4))
                .andExpect(jsonPath("$[?(@.id == " + userId + ")].role").value("PLAYER"));
    }

    @Test
    void repeatedWrongFlagsTriggerTheBruteForceCooldown() throws Exception {
        MockHttpSession player = registerAndLogin(newUsername());
        long stage5 = challengeId(5);

        for (int attempt = 0; attempt < 5; attempt++) {
            submitFlag(player, stage5, "CTF{guess_" + attempt + "}")
                    .andExpect(jsonPath("$.message").value("Incorrect flag, try again"));
            Thread.sleep(2_100); // step past the 2-second per-attempt cooldown
        }

        submitFlag(player, stage5, "CTF{un3ncrypt3d_tr4ff1c_l34k}")
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.message").value("Too many failed attempts! Cooldown active for 60 seconds."))
                .andExpect(jsonPath("$.pointsAwarded").value(0));
    }

    @Test
    void resetClearsProgressForThatStageOnly() throws Exception {
        String username = newUsername();
        MockHttpSession player = registerAndLogin(username);
        long stage1 = challengeId(1);

        unlockHint(player, stage1, 1);
        submitFlag(player, stage1, "CTF{0s1nt_f00tpr1nt_d1sc0v3r3d}")
                .andExpect(jsonPath("$.pointsAwarded").value(90));

        mvc.perform(post("/api/challenges/{id}/reset", stage1).session(player))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stageOrder").value(1))
                .andExpect(jsonPath("$.solved").value(false))
                .andExpect(jsonPath("$.penaltyDeducted").value(0))
                .andExpect(jsonPath("$.hints[0].unlocked").value(false));

        mvc.perform(get("/api/scoreboard").session(player))
                .andExpect(jsonPath("$[?(@.username == '" + username + "')]").isEmpty());
    }

    @Test
    void artifactDownloadServesTheStageFile() throws Exception {
        MockHttpSession player = registerAndLogin(newUsername());

        mvc.perform(get("/api/challenges/{id}/artifact", challengeId(2)).session(player))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"evidence_badge.png\""));

        mvc.perform(get("/api/challenges/{id}/artifact", challengeId(1)).session(player))
                .andExpect(status().isNotFound());
    }

    // --------------------------------------------------------------- admin

    @Test
    void adminCanReviewChallengesAndSubmissionsAndManageUsers() throws Exception {
        String username = newUsername();
        MockHttpSession player = registerAndLogin(username);
        submitFlag(player, challengeId(6), "CTF{wrong}");

        MockHttpSession admin = login("admin", "ChangeMe123!");

        mvc.perform(get("/api/admin/challenges").session(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stageOrder").value(1))
                .andExpect(jsonPath("$[0].hint1").value(notNullValue()))
                .andExpect(content().string(not(containsString("flagHash"))))
                .andExpect(content().string(not(containsString("$2a$"))));

        mvc.perform(get("/api/admin/submissions").session(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.user.username == '" + username + "')].submittedFlag").value("CTF{wrong}"))
                .andExpect(content().string(not(containsString("\"password\""))));

        long adminId = userRepository.findByUsername("admin").orElseThrow().getId();
        mvc.perform(delete("/api/admin/users/{id}", adminId).session(admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("You cannot delete your own logged-in admin account"));

        long playerId = userRepository.findByUsername(username).orElseThrow().getId();
        mvc.perform(delete("/api/admin/users/{id}", playerId).session(admin))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/admin/users/{id}", playerId).session(admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("User not found with id: " + playerId));
    }

    @Test
    void reseedingOnRestartUpdatesTheSameChallengeRows() throws Exception {
        List<Long> idsBefore = seededStageIds();
        assertEquals(8, idsBefore.size());

        dataSeeder.run();

        assertEquals(idsBefore, seededStageIds());
        assertEquals(1, userRepository.findAll().stream().filter(u -> u.getUsername().equals("admin")).count());

        // Flags still verify after the hashes are re-generated
        MockHttpSession player = registerAndLogin(newUsername());
        submitFlag(player, challengeId(7), "CTF{r3v3rs3_3ng1n33r_m4st3r}")
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.pointsAwarded").value(250));
    }

    @Test
    void scoreboardRanksHighestScoreFirstThenWhoeverFinishedFirst() throws Exception {
        String early = newUsername();
        String late = newUsername();
        String leader = newUsername();
        MockHttpSession earlySession = registerAndLogin(early);
        MockHttpSession lateSession = registerAndLogin(late);
        MockHttpSession leaderSession = registerAndLogin(leader);

        submitFlag(earlySession, challengeId(2), "CTF{m3t4d4t4_r3v34ls_4ll}").andExpect(jsonPath("$.pointsAwarded").value(100));
        Thread.sleep(20);
        submitFlag(lateSession, challengeId(1), "CTF{0s1nt_f00tpr1nt_d1sc0v3r3d}").andExpect(jsonPath("$.pointsAwarded").value(100));
        submitFlag(leaderSession, challengeId(3), "CTF{c1ph3r_ch41n_d3c0d3d}").andExpect(jsonPath("$.pointsAwarded").value(150));

        String body = mvc.perform(get("/api/scoreboard").session(leaderSession))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<java.util.Map<String, Object>> entries = com.jayway.jsonpath.JsonPath.read(body, "$");

        for (int i = 1; i < entries.size(); i++) {
            long previous = ((Number) entries.get(i - 1).get("totalPoints")).longValue();
            long current = ((Number) entries.get(i).get("totalPoints")).longValue();
            assertTrue(previous >= current, "scoreboard must be sorted by totalPoints descending: " + body);
        }
        List<Object> order = entries.stream().map(e -> e.get("username")).toList();
        assertTrue(order.indexOf(leader) < order.indexOf(early), body);
        // same points and solve count: the player who reached it first ranks higher
        assertTrue(order.indexOf(early) < order.indexOf(late), body);
    }

    @Test
    void adminMustSupplyAFlagWhenCreatingAChallenge() throws Exception {
        MockHttpSession admin = login("admin", "ChangeMe123!");
        mvc.perform(post("/api/admin/challenges").session(admin).contentType(APPLICATION_JSON)
                        .content(challengeJson(90, "No Flag", "", false)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Flag is required when creating a challenge"));
    }

    @Test
    void adminEditWithBlankFlagKeepsTheFlagAndAllHintTiers() throws Exception {
        MockHttpSession admin = login("admin", "ChangeMe123!");
        long id = createChallenge(admin, 91, "Draft Stage", "CTF{edit_me}");

        // What the admin form sends when the flag box is left empty
        mvc.perform(put("/api/admin/challenges/{id}", id).session(admin).contentType(APPLICATION_JSON)
                        .content(challengeJson(91, "Draft Stage (renamed)", "", false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Draft Stage (renamed)"))
                .andExpect(jsonPath("$.hint1").value("Tier one"))
                .andExpect(jsonPath("$.hint2").value("Tier two"))
                .andExpect(jsonPath("$.hint3").value("Tier three"));

        MockHttpSession player = registerAndLogin(newUsername());
        mvc.perform(get("/api/challenges/{id}", id).session(player))
                .andExpect(jsonPath("$.hints", hasSize(3)));
        submitFlag(player, id, "CTF{edit_me}")
                .andExpect(jsonPath("$.correct").value(true));

        mvc.perform(delete("/api/admin/challenges/{id}", id).session(admin)).andExpect(status().isNoContent());
    }

    @Test
    void adminCanDeleteAChallengePlayersHaveAttempted() throws Exception {
        MockHttpSession admin = login("admin", "ChangeMe123!");
        long id = createChallenge(admin, 92, "Doomed Stage", "CTF{doomed}");

        String username = newUsername();
        MockHttpSession player = registerAndLogin(username);
        unlockHint(player, id, 1).andExpect(jsonPath("$.success").value(true));
        submitFlag(player, id, "CTF{wrong}").andExpect(jsonPath("$.correct").value(false));
        Thread.sleep(2_100);
        submitFlag(player, id, "CTF{doomed}").andExpect(jsonPath("$.correct").value(true));

        mvc.perform(delete("/api/admin/challenges/{id}", id).session(admin))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/challenges/{id}", id).session(player))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Challenge not found"));
        mvc.perform(get("/api/admin/submissions").session(admin))
                .andExpect(jsonPath("$[?(@.user.username == '" + username + "')]").isEmpty());
        mvc.perform(get("/api/scoreboard").session(player))
                .andExpect(jsonPath("$[?(@.username == '" + username + "')]").isEmpty());
    }

    @Test
    void adminCanDeleteAPlayerWhoUnlockedHints() throws Exception {
        String username = newUsername();
        MockHttpSession player = registerAndLogin(username);
        unlockHint(player, challengeId(8), 1).andExpect(jsonPath("$.success").value(true));
        submitFlag(player, challengeId(8), "CTF{wrong}");

        long playerId = userRepository.findByUsername(username).orElseThrow().getId();
        MockHttpSession admin = login("admin", "ChangeMe123!");
        mvc.perform(delete("/api/admin/users/{id}", playerId).session(admin))
                .andExpect(status().isNoContent());

        assertTrue(userRepository.findByUsername(username).isEmpty());
        mvc.perform(get("/api/scoreboard").session(admin))
                .andExpect(jsonPath("$[?(@.username == '" + username + "')]").isEmpty());
    }

    // ---------------------------------------------------------------- CORS

    @Test
    void corsAllowsLocalDevelopmentOriginsWithCredentials() throws Exception {
        mvc.perform(options("/api/challenges")
                        .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));

        mvc.perform(get("/api/health").header(HttpHeaders.ORIGIN, "http://127.0.0.1:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://127.0.0.1:5173"));

        mvc.perform(options("/api/challenges")
                        .header(HttpHeaders.ORIGIN, "http://attacker.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }

    // ------------------------------------------------------------- helpers

    private static String newUsername() {
        return "player" + PLAYER_SEQ.incrementAndGet();
    }

    private static String credentials(String username, String password) {
        return "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}";
    }

    private ResultActions register(String username) throws Exception {
        return mvc.perform(post("/api/auth/register").contentType(APPLICATION_JSON)
                .content(credentials(username, PASSWORD)));
    }

    private MockHttpSession registerAndLogin(String username) throws Exception {
        register(username).andExpect(status().isCreated());
        return login(username, PASSWORD);
    }

    private MockHttpSession login(String username, String password) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login").contentType(APPLICATION_JSON)
                        .content(credentials(username, password)))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private ResultActions submitFlag(MockHttpSession session, long challengeId, String flag) throws Exception {
        return mvc.perform(post("/api/challenges/{id}/submit", challengeId).session(session)
                .contentType(APPLICATION_JSON)
                .content("{\"flag\":\"" + flag + "\"}"));
    }

    private ResultActions unlockHint(MockHttpSession session, long challengeId, int tier) throws Exception {
        return mvc.perform(post("/api/challenges/{id}/hints/{tier}", challengeId, tier).session(session));
    }

    private static String challengeJson(int stageOrder, String title, String flag, boolean active) {
        return "{\"stageOrder\":" + stageOrder + ",\"title\":\"" + title + "\",\"domain\":\"Cryptography\","
                + "\"difficulty\":\"Easy\",\"description\":\"Test stage\",\"hint\":\"Tier one\","
                + "\"hint1\":\"Tier one\",\"hint2\":\"Tier two\",\"hint3\":\"Tier three\",\"points\":100,"
                + "\"flag\":\"" + flag + "\",\"active\":" + active + "}";
    }

    /** Creates a hidden (inactive) challenge so it never shows up in other tests' player lists. */
    private long createChallenge(MockHttpSession admin, int stageOrder, String title, String flag) throws Exception {
        String body = mvc.perform(post("/api/admin/challenges").session(admin).contentType(APPLICATION_JSON)
                        .content(challengeJson(stageOrder, title, flag, false)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return ((Number) com.jayway.jsonpath.JsonPath.read(body, "$.id")).longValue();
    }

    /** Ids of the rows holding the eight seeded stages (other tests may add hidden stages 90+). */
    private List<Long> seededStageIds() {
        return challengeRepository.findAllByOrderByStageOrderAsc().stream()
                .filter(c -> c.getStageOrder() >= 1 && c.getStageOrder() <= 8)
                .map(Challenge::getId)
                .toList();
    }

    private long challengeId(int stageOrder) {
        return challengeRepository.findAll().stream()
                .filter(c -> c.getStageOrder() == stageOrder)
                .map(Challenge::getId)
                .findFirst()
                .orElseThrow();
    }
}
