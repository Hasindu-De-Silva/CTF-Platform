const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory mock database table simulating SQL table
const employees = [
  { id: 1, username: 'admin', password: 'SuperSecretHash_HexaTech_99!', role: 'SecOps Director' },
  { id: 2, username: 'marcus_vance', password: 'Vance2026MasterKey!', role: 'Principal Infrastructure Engineer' },
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
      width: 440px;
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
      color: #090d16;
      border: none;
      padding: 11px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #0891b2; }
    .hint {
      margin-top: 20px;
      padding: 12px;
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid #f59e0b;
      font-size: 12px;
      color: #fbbf24;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">STAGE 04 // PERIMETER GATEWAY</span>
    <h2>HexaTech Enterprise Portal</h2>
    <p>Restricted Substation Alpha-9 Internal Access. All authentication attempts are audited and logged.</p>
    
    <form method="POST" action="/login">
      <label>Employee Username / Service ID</label>
      <input type="text" name="username" placeholder="e.g. j_doe or admin" required autocomplete="off" />
      
      <label>Portal Access Password</label>
      <input type="password" name="password" placeholder="••••••••••••" required />
      
      <button type="submit">Authenticate Session</button>
    </form>

    <div class="hint">
      <strong>Incident Note:</strong> Decoded telemetry indicates the gateway authenticates via unparameterized SQL queries against the employee table.
    </div>
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
  <title>Admin Dashboard - HexaTech Gateway</title>
  <style>
    body {
      background: #0b0f19;
      color: #e2e8f0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      margin: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #10b981;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
    }
    .badge-success {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      color: #34d399;
      font-size: 12px;
      font-family: monospace;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    h1 { color: #10b981; margin: 0 0 12px 0; font-size: 24px; }
    .flag-box {
      background: #064e3b;
      border: 1px solid #059669;
      padding: 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 18px;
      color: #a7f3d0;
      margin: 24px 0;
      word-break: break-all;
    }
    .query-box {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      color: #38bdf8;
      margin: 16px 0;
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }
    .data-table th, .data-table td {
      border: 1px solid #1f2937;
      padding: 8px 12px;
      text-align: left;
    }
    .data-table th { background: #1e293b; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge-success">AUTHENTICATION BYPASSED // ACCESS GRANTED</span>
    <h1>Substation Alpha-9 Admin Control Portal</h1>
    <p>Session authenticated as: <strong>${result.user.username}</strong> (${result.user.role})</p>
    
    <div>Executed Database Query:</div>
    <div class="query-box">${result.query}</div>

    <div style="margin-top: 20px; font-weight: bold; color: #34d399;">Stage 4 Flag Unlocked:</div>
    <div class="flag-box">CTF{sql1_auth_byp4ss_succ3ss}</div>

    <div style="margin-top: 20px;">
      <h3 style="color:#f8fafc; font-size:16px;">Next Stage Egress Telemetry Trace:</h3>
      <p style="font-size: 13px; color: #94a3b8;">
        Substation Alpha-9 port mirror recorded Marcus's egress burst on Port 80. Packet capture archived:
        <code style="color:#06b6d4;">incident_traffic.pcap</code> (Stage 5 Wiretap Chronicle).
      </p>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>User ID</th><th>Account</th><th>Role</th><th>Egress Status</th></tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>admin</td><td>SecOps Director</td><td>Normal</td></tr>
        <tr><td>2</td><td>marcus_vance</td><td>Principal Architect</td><td><span style="color:#f87171;">Breach / Rogue Node</span></td></tr>
        <tr><td>3</td><td>guest_auditor</td><td>Security Trainee</td><td>Disabled</td></tr>
      </tbody>
    </table>
    
    <div style="margin-top: 24px;">
      <a href="/" style="color: #06b6d4; font-size: 13px; text-decoration: none;">&larr; Return to Gateway Login</a>
    </div>
  </div>
</body>
</html>`);
  } else {
    res.status(401).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Access Denied - HexaTech Gateway</title>
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
      border: 1px solid #7f1d1d;
      border-radius: 12px;
      padding: 32px;
      width: 420px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.15);
      text-align: center;
    }
    h2 { color: #ef4444; margin: 0 0 12px 0; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
    .query {
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      color: #f87171;
      word-break: break-all;
      margin-bottom: 20px;
      text-align: left;
    }
    a {
      display: inline-block;
      background: #334155;
      color: #f8fafc;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    a:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Authentication Failure</h2>
    <p>Invalid credentials or security token rejection. 0 rows returned from database.</p>
    <div class="query">${result.query}</div>
    <a href="/">&larr; Try Again</a>
  </div>
</body>
</html>`);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CTF STAGE 4] Perimeter Gateway Target running on port ${PORT}`);
});
