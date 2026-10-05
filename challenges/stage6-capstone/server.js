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
  <title>Stage 6 Capstone - Linux Terminal</title>
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
      <span>STAGE 6 CAPSTONE // LINUX SHELL (player@aegis-core)</span>
      <span>SSH: port 22 | user: player | pass: player123</span>
    </div>
    <div id="output" class="terminal">Linux aegis-core 5.15.0-generic #1 SMP x86_64
The programs included with the Ubuntu system are free software.
Last login: Wed Sep  9 2026 from 10.0.0.45

Type commands below to enumerate the target server.
Hint: Check your privileges with 'id', 'sudo -l', or 'cat NOTE_FROM_SECOPS.txt'.
</div>
    <form id="cmdForm" class="input-bar" onsubmit="runCommand(event)">
      <span class="prompt">player@aegis-core:~$</span>
      <input type="text" id="cmdInput" placeholder="e.g. id, sudo -l, ls -la..." autofocus autocomplete="off" />
      <button type="submit">Execute</button>
    </form>
    <div class="info">
      <strong>Target:</strong> Escalate from user <code>player</code> to <code>root</code> to capture the restricted flag at <code>/root/flag.txt</code>.
    </div>
  </div>

  <script>
    async function runCommand(e) {
      e.preventDefault();
      const input = document.getElementById('cmdInput');
      const terminal = document.getElementById('output');
      const cmd = input.value.trim();
      if (!cmd) return;

      terminal.textContent += '\\nplayer@aegis-core:~$ ' + cmd + '\\n';
      input.value = '';

      try {
        const res = await fetch('/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd })
        });
        const data = await res.json();
        terminal.textContent += data.output + '\\n';
        terminal.scrollTop = terminal.scrollHeight;
      } catch (err) {
        terminal.textContent += 'Error communicating with target container\\n';
      }
    }
  </script>
</body>
</html>`);
});

app.post('/exec', (req, res) => {
  const { cmd } = req.body;
  if (!cmd) return res.json({ output: '' });

  // Execute command as the unprivileged 'player' user
  // (su - player -c ...)
  const sanitizedCmd = cmd.replace(/'/g, "'\\''");
  const fullCommand = `su - player -c '${sanitizedCmd}' 2>&1`;

  exec(fullCommand, { timeout: 5000 }, (error, stdout, stderr) => {
    let out = stdout || stderr || '';
    if (error && !out) {
      out = error.message;
    }
    res.json({ output: out });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] Stage 6 Web Terminal active on http://0.0.0.0:${PORT}`);
});
