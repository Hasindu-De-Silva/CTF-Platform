import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle2, Copy, Check, ArrowLeft, ExternalLink, RefreshCw, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    role: string;
    fullName: string;
  };
  flag?: string | null;
  artifact?: string | null;
  isAdmin?: boolean;
  message?: string;
  error?: string;
}

export const Stage4GatewayView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setOfflineNotice(false);
    setLoading(true);

    try {
      // First try relative Vite proxy /stage4-api, fallback to direct port 8081
      let res: Response | null = null;
      try {
        res = await fetch('/stage4-api/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
      } catch {
        // Fallback to direct host connection if running standalone
        res = await fetch('http://localhost:8081/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
      }

      const data: AuthResponse = await res.json();

      if (res.ok && data.success) {
        setSession(data);
      } else {
        setAuthError(data.error || 'Authentication Failure: Invalid credentials or security token mismatch.');
      }
    } catch {
      setOfflineNotice(true);
      setAuthError('Connection Failed: Could not reach the Perimeter Gateway at port 8081.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFlag = () => {
    if (session?.flag) {
      navigator.clipboard.writeText(session.flag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSession(null);
    setUsername('');
    setPassword('');
    setAuthError(null);
    setOfflineNotice(false);
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
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:8081"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Direct Target (8081)
          </a>
          <span className="text-xs font-mono text-slate-500">
            STAGE 04 // GATEWAY
          </span>
        </div>
      </div>

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Portal Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider mb-1">
              Perimeter Gateway // Alpha-9
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              HexaTech Enterprise Portal
            </h1>
            <p className="text-xs text-slate-400">
              Restricted Employee Access • Substation Alpha-9
            </p>
          </div>
        </div>

        {!session ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
                autoComplete="off"
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
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}

            {offlineNotice && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Target Gateway Offline:</strong> Ensure the challenge container is active (<code className="font-mono text-amber-200">docker compose up -d ctf-stage4-web</code>) or start the target server (<code className="font-mono text-amber-200">node challenges/stage4-web/server.js</code>).
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate Session</span>
              )}
            </button>
          </form>
        ) : session.isAdmin ? (
          /* Authenticated Admin Dashboard View */
          <div className="mt-6 space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-emerald-300">
                  Authentication Bypassed // Access Granted
                </h2>
                <p className="text-xs text-emerald-400/80 font-mono">
                  Session Token: {session.user?.username} ({session.user?.role})
                </p>
              </div>
            </div>

            {session.flag && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    System Configuration Flag Recovered:
                  </span>
                  <button
                    onClick={handleCopyFlag}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Flag'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-sm tracking-wide break-all select-all">
                  {session.flag}
                </div>
              </div>
            )}

            {session.artifact && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300">
                <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[11px]">
                  Next Stage Egress Telemetry Trace:
                </span>
                <p className="leading-relaxed">
                  Substation Alpha-9 port mirror recorded Marcus's egress burst on Port 80 immediately after compromising this portal. 
                  Packet capture artifact archived: <code className="text-cyan-300 font-mono font-bold">{session.artifact}</code> (Stage 5 Wiretap Chronicle).
                </p>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Reset Gateway Session
            </button>
          </div>
        ) : (
          /* Authenticated Standard Personnel View (No Admin / No Flag) */
          <div className="mt-6 space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <Lock className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-amber-300">
                  Standard Personnel Session
                </h2>
                <p className="text-xs text-amber-400/80 font-mono">
                  Authenticated: {session.user?.fullName} ({session.user?.role})
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong>Clearance Level Insufficient:</strong> You are authenticated under a non-administrative account. Security telemetry, cryptographic key logs, and system configuration records are restricted to the SecOps Director.
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Log Out and Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
