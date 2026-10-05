async function run() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Logged in as admin');

  const challenges = [
    {
      id: 1,
      stageOrder: 1,
      title: "The Abandoned Badge",
      domain: "Steganography / OSINT",
      difficulty: "Easy",
      points: 100,
      flag: "CTF{m3t4d4t4_r3v34ls_4ll}",
      artifactUrl: "/artifacts/evidence_badge.png",
      targetUrl: null,
      description: "At 02:40 UTC, security alarms triggered across the HexaTech Core Grid. Rogue senior infrastructure engineer Marcus Vance (ID: MV-4092) initiated an insider sabotage sequence and fled the premises.\n\nAn image of his abandoned access badge (`evidence_badge.png`) was secured from his desk by incident responders. Forensics analysts suspect Marcus concealed his covert C2 transmission beacon address and initial authorization key into the non-rendered metadata of the image.\n\nDownload and inspect the artifact to recover the initial compromise flag.",
      hint: "Use EXIF metadata inspection tools (e.g. 'exiftool') or binary string extractors ('strings') to inspect non-rendered image segments and tEXt chunks.",
      active: true
    },
    {
      id: 2,
      stageOrder: 2,
      title: "The C2 Intercept",
      domain: "Cryptography",
      difficulty: "Easy",
      points: 100,
      flag: "CTF{c1ph3r_ch41n_d3c0d3d}",
      artifactUrl: "/artifacts/intercepted_payload.txt",
      targetUrl: null,
      description: "Following the C2 beacon address uncovered from Marcus Vance's badge in Stage 1, signals intelligence intercepted Marcus's encrypted outbound beacon (`intercepted_payload.txt`).\n\nMarcus disguised the transmission using a two-stage transformation: Base64 web transport encoding followed by a classical Caesar/ROT13 rotation.\n\nReverse the transformation chain to decode the transmission, recover the intelligence flag, and reveal the coordinates of the internal gateway portal.",
      hint: "First decode the outer Base64 layer, then reverse the classical rotational cipher (ROT13 shift of 13 positions) using CyberChef or Python.",
      active: true
    },
    {
      id: 3,
      stageOrder: 3,
      title: "Perimeter Gateway Infiltration",
      domain: "Web Security",
      difficulty: "Moderate",
      points: 150,
      flag: "CTF{sql1_auth_byp4ss_succ3ss}",
      artifactUrl: null,
      targetUrl: "/stage3-gateway",
      description: "The decrypted C2 transmission from Stage 2 revealed that Marcus Vance maintained access via the HexaTech Enterprise Gateway portal. The login portal dynamically concatenates raw user input into SQL queries without sanitization.\n\nLaunch the in-app Gateway portal, exploit the SQL injection vulnerability (' OR '1'='1) to bypass authentication, infiltrate the admin dashboard, and recover Marcus's active egress network session trace.",
      hint: "Analyze how username input evaluates within SQL boolean logic. Try injecting classic authentication bypass strings such as ' OR '1'='1.",
      active: true
    },
    {
      id: 4,
      stageOrder: 4,
      title: "The Wiretap Chronicle",
      domain: "Networking",
      difficulty: "Moderate",
      points: 150,
      flag: "CTF{un3ncrypt3d_tr4ff1c_l34k}",
      artifactUrl: "/artifacts/incident_traffic.pcap",
      targetUrl: null,
      description: "Inside the compromised gateway from Stage 3, you uncovered an automated network packet capture logging Marcus Vance's egress traffic (`incident_traffic.pcap`) on Port 80.\n\nAnalyze the captured traffic in Wireshark, follow the unencrypted HTTP communication stream, extract the exfiltrated session flag, and discover Marcus's note confirming he wiped his workstation hard drive before departing.",
      hint: "Open the capture in Wireshark, filter for 'http' or 'tcp.port == 80', and use 'Follow > TCP Stream' to inspect the plaintext HTTP communication.",
      active: true
    },
    {
      id: 5,
      stageOrder: 5,
      title: "The Deleted Storage Sector",
      domain: "Digital Forensics",
      difficulty: "Moderate-Hard",
      points: 200,
      flag: "CTF{f1l3_c4rv1ng_m4st3r}",
      artifactUrl: "/artifacts/disk_evidence.raw",
      targetUrl: null,
      description: "Responding to the clue discovered in Stage 4's network packet dump, forensic technicians acquired a raw disk image of Marcus Vance's wiped workstation drive (`disk_evidence.raw`).\n\nMarcus deleted his emergency backup records, but raw cluster bytes remain intact in unallocated sectors. Perform file carving or binary inspection at offset 0x8000 to reconstruct `forensic_evidence.bak`, recover the forensic flag, and obtain the temporary SSH login credentials for the core Linux mainframe.",
      hint: "File deletion removes pointers, but raw data lingers in unallocated space. Use 'strings -a disk_evidence.raw | grep CTF' or inspect cluster boundaries in a hex editor.",
      active: true
    },
    {
      id: 6,
      stageOrder: 6,
      title: "Core Mainframe Takeover",
      domain: "System Security / Capstone",
      difficulty: "Hard",
      points: 250,
      flag: "CTF{r00t_pr1v_3sc4l4t10n_d0n3}",
      artifactUrl: null,
      targetUrl: "/stage6-terminal",
      description: "Using the terminal credentials recovered from the carved workstation disk in Stage 5, you log into the core Linux mainframe (`aegis-core`) as user 'player'.\n\nMarcus Vance's sabotage protocol is counting down, and the emergency halt flag is locked in '/root/flag.txt' with restricted permissions (chmod 0600).\n\nLaunch the in-app Linux terminal, audit user permissions using 'sudo -l', exploit the passwordless sudo binary via GTFOBins, escalate to root, and capture the final flag to disarm the sabotage protocol!",
      hint: "Run 'sudo -l' to inspect allowed commands. Notice that '/usr/bin/find' can run as root without password. Execute 'sudo find . -exec /bin/sh \\; -quit' to spawn a root shell, then read '/root/flag.txt'.",
      active: true
    }
  ];

  for (const c of challenges) {
    const res = await fetch(`http://localhost:8080/api/admin/challenges/${c.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie.split(';')[0]
      },
      body: JSON.stringify(c)
    });
    console.log(`Updated Stage ${c.stageOrder} (${c.title}): status ${res.status}`);
  }
}

run().catch(console.error);
