const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory mock database table simulating SQL table
const employees = [
  { id: 1, username: 'admin', password: 'SuperSecretHash_HexaTech_99!', role: 'SecOps Director' },
  { id: 2, username: 'alex_vance', password: 'Summer2026Password!', role: 'Infrastructure Engineer' },
  { id: 3, username: 'guest_auditor', password: 'AuditorAccessOnly#', role: 'Security Trainee' }
];

// Simulated SQL Injection vulnerable evaluation
function vulnerableSqlAuth(username, password) {
  // Simulates: SELECT * FROM employees WHERE username = '${username}' AND password = '${password}'
  const rawQuery = `SELECT * FROM employees WHERE username = '${username}' AND password = '${password}'`;
  console.log(`[SQL AUDIT LOG] Executing Query: ${rawQuery}`);

  const userNorm = (username || '').toLowerCase().trim();
  const passNorm = (password || '').toLowerCase().trim();

  // Classic SQLi patterns
  const isSqli = 
    userNorm.includes("' or '1'='1") ||
    userNorm.includes("' or 1=1") ||
    userNorm.includes("' or ''='") ||
    userNorm.includes("' or 'a'='a") ||
    userNorm.includes("' or 1=1--") ||
    userNorm.includes("' or 1=1#") ||
    passNorm.includes("' or '1'='1") ||
    passNorm.includes("' or 1=1");

  if (isSqli) {
    return { success: true, user: employees[0], query: rawQuery };
  }

  // Normal credential match
  const found = employees.find(e => e.username === username && e.password === password);
  if (found) {
    return { success: true, user: found, query: rawQuery };
  }

  return { success: false, query: rawQuery };
}

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HexaTech Gateway - Internal Access</title>
  <style>
    body {
      background: #0b0f19;
      color: #e2e8f0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 32px;
      width: 420px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 0 20px rgba(6,182,212,0.1);
    }
    .badge {
      display: inline-block;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #06b6d4;
      font-size: 11px;
      font-family: monospace;
      padding: 3px 8px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    h2 { margin: 0 0 8px 0; color: #f8fafc; font-size: 20px; }
    p { font-size: 13px; color: #94a3b8; margin: 0 0 24px 0; line-height: 1.5; }
    label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 500; }
    input {
      width: 100%;
      box-sizing: border-box;
      background: #0f172a;
      border: 1px solid #334155;
      color: #f1f5f9;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 18px;
      font-family: monospace;
    }
    input:focus { outline: none; border-color: #06b6d4; }
    button {
      width: 100%;
      background: #06b6d4;
      color: #082f49;
      font-weight: 600;
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    button:hover { background: #22d3ee; }
    .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">SEC-PORTAL // NODE 03-WEB</div>
    <h2>HexaTech Enterprise Gateway</h2>
    <p>Restricted employee authentication portal. All login activity is logged and audited.</p>
    <form method="POST" action="/login">
      <label for="username">Username / Service Account ID</label>
      <input type="text" id="username" name="username" placeholder="e.g. admin" required autofocus autocomplete="off">
      
      <label for="password">Security Password</label>
      <input type="password" id="password" name="password" placeholder="••••••••••••" required>
      
      <button type="submit">Authenticate Session</button>
    </form>
    <div class="footer">STATION: CTF-PLAYBOX-STAGE3</div>
  </div>
</body>
</html>`);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const result = vulnerableSqlAuth(username, password);

  if (result.success) {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - HexaTech Gateway</title>
  <style>
    body {
      background: #0b0f19;
      color: #e2e8f0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #111827;
      border: 1px solid #10b981;
      border-radius: 12px;
      padding: 32px;
      width: 500px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5), 0 0 25px rgba(16,185,129,0.15);
    }
    .badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      color: #34d399;
      font-size: 11px;
      font-family: monospace;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    h2 { margin: 0 0 8px 0; color: #f8fafc; font-size: 22px; }
    .flag-box {
      background: #0f172a;
      border: 1px dashed #38bdf8;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .flag {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #38bdf8;
      letter-spacing: 1px;
    }
    .code {
      background: #030712;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
      color: #94a3b8;
      word-break: break-all;
    }
    a { color: #38bdf8; text-decoration: none; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">ACCESS GRANTED // AUTH BYPASS DETECTED</div>
    <h2>Welcome, ${result.user.username} (${result.user.role})</h2>
    <p>Administrative session initialized. Database authentication was validated.</p>
    
    <div class="flag-box">
      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">STAGE 3 FLAG:</div>
      <div class="flag">CTF{sql1_auth_byp4ss_succ3ss}</div>
    </div>

    <div style="margin-bottom: 20px;">
      <span style="font-size: 12px; color: #64748b;">Executed Query:</span>
      <div class="code">${result.query}</div>
    </div>

    <a href="/">&larr; Return to login portal</a>
  </div>
</body>
</html>`);
  } else {
    res.status(401).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Access Denied</title>
  <style>
    body {
      background: #0b0f19;
      color: #e2e8f0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #111827;
      border: 1px solid #ef4444;
      border-radius: 12px;
      padding: 32px;
      width: 420px;
      box-shadow: 0 0 20px rgba(239,68,68,0.15);
      text-align: center;
    }
    h2 { color: #f87171; margin-top: 0; }
    p { font-size: 13px; color: #94a3b8; }
    a { display: inline-block; margin-top: 20px; color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Authentication Failure</h2>
    <p>Invalid credentials or security token mismatch.</p>
    <a href="/">&larr; Try Again</a>
  </div>
</body>
</html>`);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] Stage 3 Vulnerable Web App active on http://0.0.0.0:${PORT}`);
});
