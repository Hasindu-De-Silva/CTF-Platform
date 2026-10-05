async function run() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'ChangeMe123!' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Logged in, cookie:', cookie);

  const puzzles = [
    {
      id: 1,
      stageOrder: 1,
      title: "Digital Footprint",
      domain: "OSINT / Reconnaissance",
      difficulty: "Easy",
      points: 100,
      flag: "CTF{recon_1s_st3p_one}",
      description: "During an OSINT investigation on a former employee, security analysts discovered their public GitHub profile. In one of the past public commit diffs (commit #8f12a4), the employee accidentally committed an internal key before removing it in a cleanup:\n\n```diff\n- export INTERNAL_API_TOKEN=\"CTF{recon_1s_st3p_one}\"\n+ export INTERNAL_API_TOKEN=\"${ENV_KEY}\"\n```\n\nAnalyze the leaked commit record to extract the flag.",
      hint: "Inspect the removed (-) line in the public git commit diff to find the hardcoded flag.",
      active: true
    },
    {
      id: 2,
      stageOrder: 2,
      title: "Caesar's Secret",
      domain: "Cryptography",
      difficulty: "Easy",
      points: 100,
      flag: "CTF{cl4ss1c_c1ph3r_br0k3n}",
      description: "An intercepted encrypted transmission contains the following ciphertext encoded with a classical Caesar substitution cipher (Shift +3):\n\nINTERCEPTED CIPHERTEXT:\nFWI{fo4vv1f_f1sk3u_eu0n3q}\n\nDecrypt the message by shifting each alphabet letter backwards by 3 positions (F -> C, W -> T, I -> F, etc.). Keep numbers and punctuation unchanged.",
      hint: "Shift each letter backwards by 3 in the alphabet (e.g., F - 3 = C, W - 3 = T, I - 3 = F). Decrypting the rest of the letters reveals the flag.",
      active: true
    },
    {
      id: 3,
      stageOrder: 3,
      title: "Broken Session",
      domain: "Web Technologies / Web Security",
      difficulty: "Moderate",
      points: 150,
      flag: "CTF{s3ss10n_pr3d1ct4bl3}",
      description: "A vulnerable web application stores user sessions as client-side Base64 encoded JSON tokens. A session cookie was extracted from an admin account:\n\nSESSION TOKEN:\neyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJzZWNyZXRfZmxhZyI6IkNURntzM3NzMTBuX3ByM2RpY3Q0YmwzfSJ9\n\nDecode this Base64 session string to read the JSON attributes and recover the flag.",
      hint: "Use a Base64 decoder (e.g., atob() in the browser console, or CyberChef) to decode the token into plain JSON.",
      active: true
    },
    {
      id: 4,
      stageOrder: 4,
      title: "Packet Whispers",
      domain: "Networking",
      difficulty: "Moderate",
      points: 150,
      flag: "CTF{pl41nt3xt_pr0t0c0l}",
      description: "A network security monitor captured a plaintext FTP data stream on port 21. Below is the reconstructed ASCII stream:\n\n220 SecureCorp FTP Server Ready.\nUSER anonymous\n331 Anonymous login ok, send ident as password.\nPASS guest@ctfplaybox.local\n230 User logged in, proceed.\nRETR secret_notes.txt\n150 Opening ASCII mode data connection for secret_notes.txt.\nCONFIDENTIAL TRANSMISSION: The access flag is CTF{pl41nt3xt_pr0t0c0l}\n226 Transfer complete.\n\nInspect the cleartext protocol exchange to extract the flag.",
      hint: "Plaintext protocols like FTP and HTTP transmit data without encryption. Read the transmission line to find the flag.",
      active: true
    },
    {
      id: 5,
      stageOrder: 5,
      title: "Deleted But Not Gone",
      domain: "Digital Forensics",
      difficulty: "Moderate-Hard",
      points: 200,
      flag: "CTF{r3c0v3r3d_4rt3f4ct}",
      description: "Forensic recovery of an unallocated disk block revealed deleted metadata containing a secret environment artifact:\n\n[OFFSET: 0x00018FA0]\n53 51 4c 49 54 45 20 66 6f 72 6d 61 74 20 33 00 ...\nDELETED_RECORD_ENTRY #1042:\n  Table: auth_artifacts\n  Column: recovered_payload\n  Value: CTF{r3c0v3r3d_4rt3f4ct}\n  Timestamp: 2026-05-18T14:32:00Z\n\nAnalyze the recovered disk artifact record to extract the flag.",
      hint: "Carved database records in unallocated space retain plaintext values. Look at the Value field in the record.",
      active: true
    },
    {
      id: 6,
      stageOrder: 6,
      title: "Full Chain Capstone",
      domain: "Web Security + Digital Forensics",
      difficulty: "Hard",
      points: 250,
      flag: "CTF{ch4in3d_3xpl01t_c0mpl3t3}",
      description: "Correlate the web application attack logs to reconstruct the intruder's exploit chain and extract the captured flag:\n\n[WEB SERVER ACCESS LOG]\n10.0.0.54 - - [18/May/2026:16:40:11 +0000] \"GET /admin/debug?cmd=cat+/etc/flag.txt HTTP/1.1\" 200 45\n[RESPONSE BODY CAPTURED]\nFlag value retrieved: CTF{ch4in3d_3xpl01t_c0mpl3t3}\n\nCombine the remote code execution parameter and response payload to submit the flag.",
      hint: "The attacker exploited command injection on /admin/debug and retrieved the flag in the response body.",
      active: true
    }
  ];

  for (const p of puzzles) {
    const res = await fetch(`http://localhost:8080/api/admin/challenges/${p.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie.split(';')[0]
      },
      body: JSON.stringify(p)
    });
    console.log(`Updated Stage ${p.stageOrder}: status ${res.status}`);
  }
}

run().catch(console.error);
