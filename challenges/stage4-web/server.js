const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 8081;

// Initialize in-memory SQLite database
const db = new DatabaseSync(':memory:');

// Populate initial schema and records
db.exec(`
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    full_name TEXT NOT NULL
  );
  INSERT INTO employees VALUES (1, 'admin', 'SuperSecretHash_HexaTech_99!', 'SecOps Director', 'System Administrator');
  INSERT INTO employees VALUES (2, 'marcus_vance', 'Vance2026MasterKey!', 'Principal Infrastructure Engineer', 'Marcus Vance');
  INSERT INTO employees VALUES (3, 'guest_auditor', 'AuditorAccessOnly#', 'Security Trainee', 'Audit Guest');

  CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  INSERT INTO system_config VALUES ('flag', 'CTF{sql1_auth_byp4ss_succ3ss}');
  INSERT INTO system_config VALUES ('egress_capture_artifact', 'incident_traffic.pcap');
  INSERT INTO system_config VALUES ('substation_node', 'Alpha-9 Perimeter Gateway');
  INSERT INTO system_config VALUES ('telemetry_status', 'Port Mirror Active (Port 80)');

  PRAGMA query_only = ON;
`);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable CORS for API consumers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper: execute raw authentication query against SQLite
function executeAuthQuery(username, password) {
  const userStr = typeof username === 'string' ? username : '';
  const passStr = typeof password === 'string' ? password : '';
  
  // Vulnerable unparameterized SQL concatenation per Table 9 specification
  const rawQuery = `SELECT * FROM employees WHERE username = '${userStr}' AND password = '${passStr}'`;
  console.log(`[SQL AUDIT LOG] Executing Query: ${rawQuery}`);

  try {
    const stmt = db.prepare(rawQuery);
    const rows = stmt.all();

    if (!rows || rows.length === 0) {
      return { success: false, status: 401, error: 'Authentication Failure: Invalid credentials or security token mismatch (0 records returned).', query: rawQuery };
    }

    const matchedUser = rows[0];
    const isAdmin = matchedUser.role === 'SecOps Director' || matchedUser.username === 'admin';

    if (isAdmin) {
      const flagRow = db.prepare("SELECT value FROM system_config WHERE key = 'flag'").get();
      const artifactRow = db.prepare("SELECT value FROM system_config WHERE key = 'egress_capture_artifact'").get();

      return {
        success: true,
        status: 200,
        user: {
          id: matchedUser.id,
          username: matchedUser.username,
          role: matchedUser.role,
          fullName: matchedUser.full_name
        },
        flag: flagRow ? flagRow.value : null,
        artifact: artifactRow ? artifactRow.value : null,
        isAdmin: true,
        query: rawQuery
      };
    } else {
      return {
        success: true,
        status: 200,
        user: {
          id: matchedUser.id,
          username: matchedUser.username,
          role: matchedUser.role,
          fullName: matchedUser.full_name
        },
        flag: null,
        artifact: null,
        isAdmin: false,
        message: 'Personnel Access Granted. Config telemetry restricted to SecOps Director.',
        query: rawQuery
      };
    }
  } catch (err) {
    console.error(`[SQL ERROR] ${err.message}`);
    return {
      success: false,
      status: 400,
      error: `SQL Execution Error: ${err.message}`,
      query: rawQuery
    };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'HexaTech Perimeter Gateway',
    node: 'Alpha-9',
    database: 'SQLite (in-memory, PRAGMA query_only enabled)'
  });
});

// Target Portal HTML Login Page (Clean, authentic enterprise UI - zero spoilers)
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HexaTech Gateway - Internal Access</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 14px;
      padding: 36px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5), 0 0 30px rgba(6,182,212,0.08);
    }
    .badge {
      display: inline-block;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #06b6d4;
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h2 { margin: 0 0 8px 0; color: #f8fafc; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    p { font-size: 13px; color: #94a3b8; margin: 0 0 24px 0; line-height: 1.5; }
    label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family: ui-monospace, SFMono-Regular, monospace; }
    input {
      width: 100%;
      background: #0b0f19;
      border: 1px solid #334155;
      color: #f1f5f9;
      padding: 11px 14px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 18px;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input:focus { outline: none; border-color: #06b6d4; box-shadow: 0 0 0 2px rgba(6,182,212,0.2); }
    button {
      width: 100%;
      background: #06b6d4;
      color: #090d16;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s, transform 0.05s;
    }
    button:hover { background: #0891b2; }
    button:active { transform: translateY(1px); }
    .footer-note {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #1e293b;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      font-family: ui-monospace, monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Perimeter Gateway // Alpha-9</span>
    <h2>HexaTech Enterprise Portal</h2>
    <p>Restricted Substation Alpha-9 Internal Access. All authentication attempts are audited and logged.</p>
    
    <form method="POST" action="/login">
      <label>Employee Username / Service ID</label>
      <input type="text" name="username" placeholder="e.g. j_doe or admin" required autocomplete="off" />
      
      <label>Portal Access Password</label>
      <input type="password" name="password" placeholder="••••••••••••" required />
      
      <button type="submit">Authenticate Session</button>
    </form>

    <div class="footer-note">
      NODE: ALPHA-9-GW • AUTH SYSTEM: SQLITE-CORE
    </div>
  </div>
</body>
</html>`);
});

// Form Submission Endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const result = executeAuthQuery(username, password);

  if (result.success && result.isAdmin) {
    // Admin Dashboard - Displays flag and Stage 5 traffic artifact
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Dashboard - HexaTech Gateway</title>
  <style>
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px 20px;
      margin: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #10b981;
      border-radius: 14px;
      padding: 36px;
      box-shadow: 0 0 35px rgba(16, 185, 129, 0.15);
    }
    .badge-success {
      display: inline-block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid #10b981;
      color: #34d399;
      font-size: 11px;
      font-family: monospace;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    h1 { color: #10b981; margin: 0 0 12px 0; font-size: 24px; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
    .flag-box {
      background: #064e3b;
      border: 1px solid #059669;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 18px;
      color: #a7f3d0;
      margin: 20px 0;
      word-break: break-all;
      font-weight: 700;
    }
    .telemetry-card {
      background: #0f172a;
      border: 1px solid #334155;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .telemetry-card h3 {
      margin: 0 0 8px 0;
      color: #38bdf8;
      font-size: 15px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      font-size: 13px;
    }
    .data-table th, .data-table td {
      border: 1px solid #1f2937;
      padding: 10px 14px;
      text-align: left;
    }
    .data-table th { background: #1e293b; color: #94a3b8; font-weight: 600; }
    .btn-return {
      display: inline-block;
      margin-top: 24px;
      color: #06b6d4;
      font-size: 13px;
      text-decoration: none;
      font-weight: 500;
    }
    .btn-return:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge-success">PRIVILEGED SESSION // AUTHENTICATION GRANTED</span>
    <h1>Substation Alpha-9 Admin Control Portal</h1>
    <p>Session authenticated as: <strong>${result.user.username}</strong> (${result.user.role})</p>

    <div style="margin-top: 24px; font-weight: 600; color: #34d399; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
      System Configuration Flag Recovered:
    </div>
    <div class="flag-box">${result.flag}</div>

    <div class="telemetry-card">
      <h3>Next Stage Egress Telemetry Trace</h3>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">
        Substation Alpha-9 port mirror recorded Marcus's egress burst on Port 80. Packet capture archived:
        <code style="color: #38bdf8; font-weight: bold; font-family: monospace;">${result.artifact}</code> (Stage 5 Wiretap Chronicle).
      </p>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>User ID</th><th>Account</th><th>Role</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>admin</td><td>SecOps Director</td><td><span style="color:#34d399;">Active</span></td></tr>
        <tr><td>2</td><td>marcus_vance</td><td>Principal Infrastructure Engineer</td><td><span style="color:#f87171;">Breach / Rogue Node</span></td></tr>
        <tr><td>3</td><td>guest_auditor</td><td>Security Trainee</td><td><span style="color:#94a3b8;">Restricted</span></td></tr>
      </tbody>
    </table>
    
    <div>
      <a href="/" class="btn-return">&larr; Return to Gateway Login</a>
    </div>
  </div>
</body>
</html>`);
  } else if (result.success && !result.isAdmin) {
    // Non-admin login stays non-admin per Table 9 validation requirements
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Personnel Portal - HexaTech Gateway</title>
  <style>
    body { background: #090d16; color: #e2e8f0; font-family: sans-serif; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #334155; border-radius: 12px; padding: 32px; }
    h2 { color: #f8fafc; }
    .alert { background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 12px; color: #fbbf24; font-size: 13px; margin: 20px 0; }
    a { color: #06b6d4; text-decoration: none; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>HexaTech Personnel Portal</h2>
    <p>Logged in as: <strong>${result.user.fullName}</strong> (${result.user.role})</p>
    <div class="alert">
      <strong>Clearance Notice:</strong> Standard employee account. Administrative security telemetry and system configuration records are restricted to the SecOps Director.
    </div>
    <a href="/">&larr; Log out</a>
  </div>
</body>
</html>`);
  } else {
    // 401 Unauthorized or 400 SQL error
    res.status(result.status || 401).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Access Denied - HexaTech Gateway</title>
  <style>
    body {
      background: #090d16;
      color: #e2e8f0;
      font-family: sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #111827;
      border: 1px solid #7f1d1d;
      border-radius: 14px;
      padding: 36px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.15);
      text-align: center;
    }
    h2 { color: #ef4444; margin: 0 0 12px 0; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    a {
      display: inline-block;
      background: #334155;
      color: #f8fafc;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }
    a:hover { background: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Authentication Failure</h2>
    <p>${result.error || 'Invalid credentials or security token mismatch.'}</p>
    <a href="/">&larr; Return to Login</a>
  </div>
</body>
</html>`);
  }
});

// JSON API Endpoint (Used by in-app React frontend)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const result = executeAuthQuery(username, password);
  return res.status(result.status || (result.success ? 200 : 401)).json(result);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CTF STAGE 4] Perimeter Gateway Target running on port ${PORT}`);
  console.log(`[CTF STAGE 4] SQLite in-memory database initialized with PRAGMA query_only = ON`);
});
