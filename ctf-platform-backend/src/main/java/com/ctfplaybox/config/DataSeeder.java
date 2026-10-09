package com.ctfplaybox.config;

import com.ctfplaybox.model.Challenge;
import com.ctfplaybox.model.HintUnlock;
import com.ctfplaybox.model.Role;
import com.ctfplaybox.model.User;
import com.ctfplaybox.repository.ChallengeRepository;
import com.ctfplaybox.repository.HintUnlockRepository;
import com.ctfplaybox.repository.UserRepository;
import com.ctfplaybox.service.ChallengeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Transactional
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;
    private final HintUnlockRepository hintUnlockRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, ChallengeRepository challengeRepository,
                      HintUnlockRepository hintUnlockRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.challengeRepository = challengeRepository;
        this.hintUnlockRepository = hintUnlockRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedChallenges();
        syncHintPenalties();
    }

    private void seedAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("ChangeMe123!"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("Seeded default admin - username: admin / password: ChangeMe123!");
        }
    }

    private void seedChallenges() {
        // Stage 1: OSINT / Reconnaissance (100 pts)
        upsertChallenge(1, "The Public Footprint",
                "OSINT / Reconnaissance", "Easy",
                "At 02:40 UTC, security alarms sounded across HexaTech Core Grid Facility. Senior infrastructure engineer Marcus Vance (ID: MV-4092) initiated an unauthorized insider sabotage sequence and fled the premises.\n\nAs incident responders, your investigation begins by searching what digital traces Marcus left on the public internet. Access the OSINT investigation portal to inspect Marcus's public professional profile and archived technical forum posts.\n\nFind Marcus's online handle, locate the post referencing his lost security badge, and assemble the two hidden flag fragments.",
                "Inspect the public profile markup and check the archived forum post signature for hidden tokens.",
                "Look for a second source mentioning the same alias.",
                "Compare the alias on both pages, read the page source and inspect non-rendered comments.",
                "One fragment hides in the profile markup, the other in the post signature; join them in the order the post gives.",
                100, "CTF{0s1nt_f00tpr1nt_d1sc0v3r3d}", null, "/stage1-osint");

        // Stage 2: Steganography (100 pts)
        upsertChallenge(2, "The Abandoned Badge",
                "Steganography", "Easy",
                "Marcus's abandoned physical staff badge (`evidence_badge.png`) was recovered by security personnel near Substation Alpha-9, exactly as mentioned in his forum post.\n\nDigital forensic analysts suspect the badge image conceals more than visible pixels: Marcus embedded his covert C2 communications channel key and operational instructions within the file.\n\nInspect the badge artifact to distinguish between decoy metadata and hidden data, extract the secret note, recover the flag, and preserve the channel key for Stage 3.",
                "Not everything in an image file is pixels.",
                "Not everything in an image file is pixels.",
                "Check the metadata, then look at how colour values store data.",
                "Extract the least-significant bit plane (e.g. zsteg); ignore the EXIF comment.",
                100, "CTF{m3t4d4t4_r3v34ls_4ll}", "/artifacts/evidence_badge.png", null);

        // Stage 3: Cryptography (150 pts)
        upsertChallenge(3, "The C2 Intercept",
                "Cryptography", "Moderate",
                "Signals intelligence intercepted a scrambled egress transmission (`intercepted_payload.txt`) broadcast by Marcus to his hidden command-and-control channel.\n\nTelemetry indicates the message was protected using a multi-step transformation: an outer web serialization encoding (Base64) followed by a keyed classical polyalphabetic cipher (Vigenere) using the channel key recovered from his badge in Stage 2.\n\nReverse the transformation chain to recover the plaintext, capture the flag, and uncover the address of the internal perimeter gateway portal.",
                "Two kinds of scrambling were applied; peel the outer one first.",
                "Two kinds of scrambling were applied; peel the outer one first.",
                "The outer layer is a transport encoding, the inner a keyed cipher; recall the badge's key.",
                "Base64-decode, then Vigenere-decrypt with the Stage 2 channel key.",
                150, "CTF{c1ph3r_ch41n_d3c0d3d}", "/artifacts/intercepted_payload.txt", null);

        // Stage 4: Web Security (150 pts)
        upsertChallenge(4, "Perimeter Gateway Infiltration",
                "Web Security", "Moderate",
                "The decrypted C2 transmission revealed that Marcus Vance still maintains credentials into the HexaTech Perimeter Gateway portal at Substation Alpha-9.\n\nInfiltrate the perimeter gateway, analyze the login authentication mechanism, bypass authentication to gain administrator access, recover the flag from the configuration records, and locate the reference to the egress network capture.",
                "The gateway builds its login check from what you type.",
                "The gateway builds its login check from what you type.",
                "Try characters with special SQL meaning; think about the WHERE clause.",
                "A condition always true in the username field returns the admin row.",
                150, "CTF{sql1_auth_byp4ss_succ3ss}", null, "/stage4-gateway");

        // Stage 5: Networking (200 pts)
        upsertChallenge(5, "The Wiretap Chronicle",
                "Networking", "Moderate-Hard",
                "On the compromised gateway dashboard, you recovered an automated wiretap capture (`incident_traffic.pcap`) recording Marcus's outbound network traffic.\n\nOpen the capture in Wireshark, analyze network protocols, filter out decoy noise, follow the unencrypted HTTP conversation, and reassemble the payload to extract the exfiltration flag and locate proof that Marcus wiped his workstation hard drive.",
                "Most traffic is noise. Look for an unusual destination.",
                "Most traffic is noise. Look for an unusual destination.",
                "Use conversation statistics, then filter HTTP requests that send data.",
                "Follow the POST's TCP stream; the flag is in the reassembled body.",
                200, "CTF{un3ncrypt3d_tr4ff1c_l34k}", "/artifacts/incident_traffic.pcap", null);

        // Stage 6: Digital Forensics (250 pts)
        upsertChallenge(6, "The Deleted Storage Sector",
                "Digital Forensics", "Hard",
                "Acting on the wipe evidence uncovered in Stage 5, forensic technicians imaged Marcus's workstation hard drive (`disk_evidence.raw`).\n\nMarcus ran a quick wipe sequence before fleeing, leaving raw cluster records intact in unallocated sectors. Perform file carving or forensic analysis to reconstruct `forensic_evidence.bak`.\n\nRecover the forensics flag, discover the temporary mainframe terminal credentials for user 'player', and extract Marcus's compiled sabotage binary (`countdown.elf`).",
                "Deleting a file removes the pointer, not necessarily the data.",
                "Deleting a file removes the pointer, not necessarily the data.",
                "Use a forensic tool to list deleted entries, or carve by signature.",
                "List deleted files with fls, recover with icat, then unpack.",
                250, "CTF{f1l3_c4rv1ng_m4st3r}", "/artifacts/disk_evidence.raw", null);

        // Stage 7: Reverse Engineering (250 pts)
        upsertChallenge(7, "The Sabotage Binary",
                "Reverse Engineering", "Hard",
                "Inside the carved forensic backup from Stage 6, you recovered Marcus's compiled Linux executable (`countdown.elf`). This stripped x86-64 binary manages the HexaTech Core Grid sabotage timer.\n\nThe binary enforces an input verification loop: it reads an emergency authorization phrase, performs a byte-wise transform against a hardcoded lookup table, and validates the result.\n\nReverse engineer the binary using static analysis or the in-app Binary Workbench, recover the reverse engineering flag, and obtain the authorization phrase required to disarm the mainframe in Stage 8.",
                "Not all of the answer is in the file. Look at what the program does with your input.",
                "Not all of the answer is in the file. Look at what the program does with your input.",
                "Find the function reading the phrase; study its per-byte transform loop.",
                "Reverse the per-byte transform against the stored table to get the phrase.",
                250, "CTF{r3v3rs3_3ng1n33r_m4st3r}", "/artifacts/countdown.elf", "/stage7-binary");

        // Stage 8: Linux / System Security (300 pts)
        upsertChallenge(8, "Core Mainframe Takeover",
                "Linux / System Security", "Hard",
                "With the credentials found in Stage 6 (`player` / `AegisAccess#2026`) and the authorization phrase decrypted in Stage 7, you connect to the HexaTech Core Mainframe (`aegis-core`).\n\nThe emergency halt console (`/opt/halt_console`) is restricted to user 'root'. Audit your assigned user privileges with 'sudo -l', identify the misconfigured GTFOBins binary (`find`), escalate privileges to root, and execute the halt console with the Stage 7 authorization phrase to halt the sabotage and capture the final capstone flag!",
                "Start by asking the system what you are allowed to do.",
                "Start by asking the system what you are allowed to do.",
                "Inspect your sudo rights; a permitted program may launch others (see GTFOBins).",
                "Use the program's execute option for a root shell, then run the console with the phrase.",
                300, "CTF{r00t_pr1v_3sc4l4t10n_d0n3}", null, "/stage8-terminal");

        log.info("Seeded/Updated 8 interconnected challenges across 8 domains (1500 pts total) for Operation Aegis Breach!");
    }

    private void upsertChallenge(int stageOrder, String title, String domain, String difficulty,
                                 String description, String hint, String hint1, String hint2, String hint3,
                                 int points, String plaintextFlag, String artifactUrl, String targetUrl) {
        Challenge c = challengeRepository.findFirstByStageOrderOrderByIdAsc(stageOrder)
                .orElseGet(Challenge::new);
        c.setStageOrder(stageOrder);
        c.setTitle(title);
        c.setDomain(domain);
        c.setDifficulty(difficulty);
        c.setDescription(description);
        c.setHint(hint);
        c.setHint1(hint1);
        c.setHint2(hint2);
        c.setHint3(hint3);
        c.setPoints(points);
        c.setActive(true);
        c.setArtifactUrl(artifactUrl);
        c.setTargetUrl(targetUrl);
        c.setFlagHash(passwordEncoder.encode(plaintextFlag));
        challengeRepository.save(c);
    }

    private void syncHintPenalties() {
        List<HintUnlock> unlocks = hintUnlockRepository.findAll();
        int updated = 0;
        for (HintUnlock unlock : unlocks) {
            if (unlock.getChallenge() != null && unlock.getTier() != null) {
                int correctPenalty = ChallengeService.getHintPenalty(unlock.getChallenge().getPoints(), unlock.getTier());
                if (unlock.getPenaltyPoints() == null || unlock.getPenaltyPoints() != correctPenalty) {
                    unlock.setPenaltyPoints(correctPenalty);
                    hintUnlockRepository.save(unlock);
                    updated++;
                }
            }
        }
        if (updated > 0) {
            log.info("Synchronized {} hint unlock penalties to enforce 50% cap and 750 min score.", updated);
        }
    }
}
