import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle2, Copy, Check, ArrowLeft, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stage4GatewayView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [executedQuery, setExecutedQuery] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const flag = "CTF{sql1_auth_byp4ss_succ3ss}";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const query = `SELECT * FROM employees WHERE username = '${username}' AND password = '${password}'`;
    setExecutedQuery(query);

    const uNorm = (username || '').toLowerCase().trim();
    const pNorm = (password || '').toLowerCase().trim();

    // SQL Injection detection logic
    const isSqli =
      uNorm.includes("' or '1'='1") ||
      uNorm.includes("' or 1=1") ||
      uNorm.includes("' or ''='") ||
      uNorm.includes("' or 'a'='a") ||
      uNorm.includes("' or 1=1--") ||
      uNorm.includes("' or 1=1#") ||
      pNorm.includes("' or '1'='1") ||
      pNorm.includes("' or 1=1");

    if (isSqli) {
      setAuthenticatedUser("SecOps Administrator (Marcus Vance Privileges Infiltrated)");
    } else if (username === 'admin' && password === 'SuperSecretHash_HexaTech_99!') {
      setAuthenticatedUser("SecOps Administrator");
    } else {
      setAuthError("Authentication Failure: Invalid credentials or security token mismatch (0 rows returned).");
    }
  };

  const handleCopyFlag = () => {
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Navigation Header */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Arena
        </Link>
        <span className="text-xs font-mono text-slate-500">
          STAGE 04 // PERIMETER GATEWAY
        </span>
      </div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Portal Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider mb-1">
              Stage 04 Gateway
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              HexaTech Enterprise Portal
            </h1>
            <p className="text-xs text-slate-400">
              Restricted Employee Access • Substation Alpha-9
            </p>
          </div>
        </div>

        {!authenticatedUser ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Story Clue (from Stage 3 C2 Intercept):</strong> Decrypted transmission notes state: <em>"The perimeter authentication script evaluates raw SQL without parameterization. Force the boolean clause to bypass."</em>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                Employee Username / Service ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. j_doe or admin"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                Portal Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {executedQuery && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Database className="w-3.5 h-3.5" /> Executed Query Simulation:
                </div>
                <div className="text-cyan-400 break-all">{executedQuery}</div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <span>Authenticate Session</span>
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard View */
          <div className="mt-6 space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-emerald-300">
                  Authentication Bypassed Successfully!
                </h2>
                <p className="text-xs text-emerald-400/80 font-mono">
                  Session Token: {authenticatedUser}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Stage 04 Capture The Flag Token:
                </span>
                <button
                  onClick={handleCopyFlag}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Flag'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm tracking-wide break-all select-all">
                {flag}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Next Stage Lead (Stage 5 Wiretap):
              </span>
              <p className="leading-relaxed">
                Substation Alpha-9 network tap logged an unencrypted egress burst on Port 80 immediately after Marcus compromised this portal. 
                Packet capture artifact: <code className="text-cyan-300 font-mono">incident_traffic.pcap</code>.
              </p>
            </div>

            <button
              onClick={() => {
                setAuthenticatedUser(null);
                setExecutedQuery(null);
              }}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              Reset Gateway Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
