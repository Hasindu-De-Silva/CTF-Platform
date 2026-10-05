import React, { useState } from 'react';
import { Shield, Key, AlertCircle, CheckCircle2, Copy, Check, ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stage3GatewayView: React.FC = () => {
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
      setAuthError("Authentication Failure: Invalid credentials or security token mismatch.");
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
          NODE 03 // PORTAL TARGET
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
              Perimeter Gateway
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
                <strong>Story Clue (from Stage 2):</strong> Decrypted transmission notes state: <em>"The perimeter authentication script evaluates raw SQL without parameterization. Force the boolean clause to bypass."</em>
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
                placeholder="e.g. admin' OR '1'='1"
                required
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Authenticate Gateway Session
            </button>

            {executedQuery && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Database Query Executed:
                </span>
                <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-amber-300 break-all">
                  <code>{executedQuery}</code>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* Authenticated Dashboard View */
          <div className="mt-6 space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-300">
                  Authentication Bypassed Successfully!
                </h3>
                <p className="text-xs text-emerald-400/80">
                  SQL injection evaluated to TRUE. Elevated session active for {authenticatedUser}.
                </p>
              </div>
            </div>

            {/* Flag Award Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                Captured Flag (Stage 3):
              </span>
              <div className="flex items-center justify-between gap-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <code className="text-sm font-mono font-bold text-cyan-300 select-all">
                  {flag}
                </code>
                <button
                  type="button"
                  onClick={handleCopyFlag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Story Lead to Stage 4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Extracted Incident Lead (Next Clue for Stage 4):</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reviewing Marcus Vance's internal gateway session revealed that an automated packet sniffer was monitoring Port 80 egress traffic during the breach. Marcus's unencrypted session exchange was captured in <code className="text-cyan-300">incident_traffic.pcap</code>! Download the PCAP in Stage 4 to trace his next move.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthenticatedUser(null);
                  setExecutedQuery(null);
                }}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
              >
                &larr; Log out & test another payload
              </button>

              <Link
                to="/challenges"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/20"
              >
                Submit Flag in Arena &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
