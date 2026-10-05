const express = require('express');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 8086;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Stage 8 Capstone - Core Mainframe Terminal</title>
  <style>
    body {
      background: #030712;
      color: #10b981;
      font-family: 'Courier New', Courier, monospace;
      padding: 24px;
      margin: 0;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #0b0f19;
      border: 1px solid #1f2937;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(16,185,129,0.1);
      overflow: hidden;
    }
    .header {
      background: #111827;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #1f2937;
      color: #94a3b8;
      font-size: 13px;
    }
    .dots { display: flex; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }
    .terminal {
      padding: 16px;
      min-height: 400px;
      background: #000;
      color: #34d399;
      font-size: 14px;
      line-height: 1.4;
      white-space: pre-wrap;
      overflow-y: auto;
      max-height: 500px;
    }
    .input-bar {
      display: flex;
      background: #0f172a;
      border-top: 1px solid #1f2937;
      padding: 10px 14px;
      align-items: center;
    }
    .prompt {
      color: #38bdf8;
      font-weight: bold;
      margin-right: 8px;
    }
    input {
      flex: 1;
      background: transparent;
      border: none;
      color: #f8fafc;
      font-family: monospace;
      font-size: 14px;
      outline: none;
    }
    button {
      background: #10b981;
      color: #022c22;
      font-weight: bold;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
    }
    .info {
      padding: 12px 16px;
      background: #111827;
      border-top: 1px solid #1f2937;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div>STAGE 08 CAPSTONE // CORE MAINFRAME [AEGIS-CORE]</div>
      <div>SESSION: SSH-PLAYER</div>
    </div>
    
    <div class="terminal" id="termOutput">Linux aegis-core 6.8.0-generic #1 SMP x86_64
HEXATECH CORE MAINFRAME // EMERGENCY DISARM CONSOLE
Connected as: player (UID 1000)

Marcus Vance initiated the Core Grid Sabotage sequence!
The emergency halt console is locked at /opt/halt_console and requires ROOT privilege.

Type commands below to enumerate the target:
  - id
  - whoami
  - sudo -l
  - cat NOTE_FROM_SECOPS.txt
</div>

    <form class="input-bar" id="termForm">
      <span class="prompt" id="promptText">player@aegis-core:~$</span>
      <input type="text" id="cmdInput" autofocus autocomplete="off" />
      <button type="submit">Send</button>
    </form>

    <div class="info">
      <strong>GTFOBins Advisory:</strong> Inspect your sudo rights using <code>sudo -l</code>. If a binary is permitted with NOPASSWD, check GTFOBins for root shell spawning.
    </div>
  </div>

  <script>
    const form = document.getElementById('termForm');
    const input = document.getElementById('cmdInput');
    const output = document.getElementById('termOutput');
    const prompt = document.getElementById('promptText');

    let isRoot = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cmd = input.value.trim();
      if (!cmd) return;

      output.innerText += '\\n' + prompt.innerText + ' ' + cmd + '\\n';
      input.value = '';

      if (cmd.toLowerCase() === 'clear') {
        output.innerText = '';
        return;
      }

      try {
        const res = await fetch('/api/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd, isRoot })
        });
        const data = await res.json();
        output.innerText += data.output + '\\n';
        if (data.isRoot) {
          isRoot = true;
          prompt.innerText = 'root@aegis-core:~#';
        }
      } catch (err) {
        output.innerText += '[ERROR] Command execution failure\\n';
      }

      output.scrollTop = output.scrollHeight;
    });
  </script>
</body>
</html>`);
});

app.post('/api/exec', (req, res) => {
  const { cmd, isRoot } = req.body;
  const lower = (cmd || '').trim().toLowerCase();

  if (lower === 'id') {
    return res.json({
      output: isRoot ? 'uid=0(root) gid=0(root) groups=0(root)' : 'uid=1000(player) gid=1000(player) groups=1000(player)',
      isRoot
    });
  }

  if (lower === 'whoami') {
    return res.json({
      output: isRoot ? 'root' : 'player',
      isRoot
    });
  }

  if (lower === 'sudo -l' || lower === 'sudo -list') {
    return res.json({
      output: `Matching Defaults entries for player on aegis-core:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User player may run the following commands on aegis-core:
    (root) NOPASSWD: /usr/bin/find`,
      isRoot
    });
  }

  if (lower.startsWith('sudo find') || lower.startsWith('sudo /usr/bin/find')) {
    if (lower.includes('-exec') || lower.includes('sh') || lower.includes('bash')) {
      return res.json({
        output: `Spawning elevated root subshell via GTFOBins /usr/bin/find...
[+] Privilege Escalation Successful! Effective UID: 0 (root).
[!] Now run /opt/halt_console with the Stage 7 authorization phrase to halt the sabotage sequence.`,
        isRoot: true
      });
    }
  }

  if (lower.startsWith('/opt/halt_console') || lower.startsWith('python3 /opt/halt_console')) {
    if (!isRoot) {
      return res.json({
        output: `[FATAL ERROR] Permission Denied: This emergency halt console requires ROOT privileges.
[!] Audit your user permissions using 'sudo -l' to locate escalation vectors.`,
        isRoot: false
      });
    }

    if (lower.includes('aegis-halt-2026-omega')) {
      return res.json({
        output: `============================================================
HEXATECH CORE MAINFRAME // EMERGENCY DISARM PROTOCOL
Console: /opt/halt_console [EUID 0 RESTRICTED]
============================================================

[+] VERIFYING AUTHORIZATION TOKEN: AEGIS-HALT-2026-OMEGA
[+] Root authority confirmed (UID 0).
[+] Reversing power grid sabotage sequence...
[+] Core grid capacitors neutralized!

============================================================
>>> OPERATION AEGIS BREACH COMPLETE! <<<
>>> Final Capstone Flag: CTF{r00t_pr1v_3sc4l4t10n_d0n3} <<<
============================================================`,
        isRoot: true
      });
    } else {
      return res.json({
        output: `[-] REJECTED: Invalid authorization phrase!
[-] Reverse engineer Marcus's 'countdown.elf' binary to recover the valid phrase.`,
        isRoot: true
      });
    }
  }

  if (lower === 'cat /root/flag.txt' || lower === 'cat flag.txt') {
    if (isRoot) {
      return res.json({
        output: 'CTF{r00t_pr1v_3sc4l4t10n_d0n3}\n\n[SUCCESS] Sabotage sequence halted!',
        isRoot: true
      });
    } else {
      return res.json({
        output: 'cat: /root/flag.txt: Permission denied',
        isRoot: false
      });
    }
  }

  if (lower.startsWith('cat note')) {
    return res.json({
      output: `[URGENT SECURITY ADVISORY // TASK FORCE 4]
Marcus Vance initiated the Core Grid Sabotage sequence!
The emergency halt console is locked at /opt/halt_console and requires ROOT privilege.

Check allowed administrative privileges using 'sudo -l' to discover misconfigured execution rights!
Once root is achieved, execute:
    /opt/halt_console <Stage 7 Authorization Phrase>`,
      isRoot
    });
  }

  return res.json({
    output: `${cmd}: command simulated or not found. Type 'cat NOTE_FROM_SECOPS.txt' or 'sudo -l'.`,
    isRoot
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CTF STAGE 8] Core Mainframe Target running on port ${PORT}`);
});
