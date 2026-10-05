import React, { useState } from 'react';
import { Globe, FileText, MessageSquare, Code, Copy, Check, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stage1OSINTView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'forum'>('profile');
  const [viewSource, setViewSource] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fragment1, setFragment1] = useState('');
  const [fragment2, setFragment2] = useState('');
  const [assembledFlag, setAssembledFlag] = useState<string | null>(null);

  const handleAssemble = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fragment1.trim() && !fragment2.trim()) return;
    const full = fragment1.trim() + fragment2.trim();
    setAssembledFlag(full);
  };

  const handleCopyFlag = () => {
    if (assembledFlag) {
      navigator.clipboard.writeText(assembledFlag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-8 animate-in">
      {/* Top Header */}
      <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Arena
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold uppercase">
              Stage 01 // OSINT Reconnaissance
            </span>
            <span className="text-xs text-slate-500 font-mono">NODE 01</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            HexaTech Public Reconnaissance Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject: Marcus Vance (MV-4092) • Target: Public Internet Footprint Correlation
          </p>
        </div>

        {/* Tab & View Mode Toggles */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Staff Directory
          </button>
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'forum'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> TechEnergy Forum
          </button>
          <button
            onClick={() => setViewSource(!viewSource)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              viewSource
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> {viewSource ? 'Rendered View' : 'Inspect Source'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Browser Window */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col">
          {/* Simulated Browser Bar */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="ml-3 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px] flex items-center gap-2">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>
                  {activeTab === 'profile'
                    ? 'https://directory.hexatech.local/staff/mvance-4092'
                    : 'https://community.techenergy.org/threads/8921-lost-badge-alpha9'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">HTTP/2 • 200 OK</span>
          </div>

          {/* Browser Body */}
          <div className="p-6 flex-1 min-h-[420px] overflow-y-auto">
            {viewSource ? (
              /* Raw Source Code View */
              <div className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {activeTab === 'profile' ? (
                  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HexaTech Staff Directory // Marcus Vance</title>
</head>
<body>
  <!-- ======================================================== -->
  <!-- RECONNAISSANCE AUDIT LOG: Marcus Vance public employee record -->
  <!-- Token Fragment 1: CTF{0s1nt_                            -->
  <!-- ======================================================== -->
  <div class="employee-card">
    <h1>Marcus Vance (MV-4092)</h1>
    <p>Role: Principal SCADA Systems Architect</p>
    <p>Division: HexaTech Core Grid Infrastructure (Substation Alpha-9)</p>
    <p>Forum Handle: @mv_infra_lead</p>
    <p>Workstation: HEX-WS-VANCE-04</p>
  </div>
</body>
</html>`
                ) : (
                  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PowerTech Energy Forums // Thread #8921</title>
</head>
<body>
  <article class="forum-post">
    <h2>[Lost & Found] Dropped Access Badge near Substation Alpha-9 Turnstile</h2>
    <div class="meta">Author: @mv_infra_lead (Marcus Vance)</div>
    <div class="content">
      Security desk confirmed they picked up my physical badge (evidence_badge.png)
      and logged it into the physical evidence lockbox.
    </div>
    <div class="signature">
      ---
      Marcus Vance | Principal SCADA Architect @ HexaTech
      "Verification Token Part 2: f00tpr1nt_d1sc0v3r3d} (Assembly Directive: Part 1 + Part 2)"
    </div>
  </article>
</body>
</html>`
                )}
              </div>
            ) : activeTab === 'profile' ? (
              /* Rendered Profile Page */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">Marcus Vance</h2>
                    <p className="text-xs text-cyan-400 font-mono">Employee ID: MV-4092</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    ACTIVE PERSONNEL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Department</span>
                    <span className="text-slate-200 font-medium">Core Grid Infrastructure</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Assigned Station</span>
                    <span className="text-slate-200 font-medium">Substation Alpha-9</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Community Handle</span>
                    <span className="text-cyan-300 font-mono font-bold">@mv_infra_lead</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500 block mb-1 uppercase font-semibold">Assigned Workstation</span>
                    <span className="text-slate-200 font-mono">HEX-WS-VANCE-04</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-500 block mb-1 uppercase font-semibold">Responsibilities</span>
                  Primary maintainer of automated emergency disarm sequences and Linux SCADA controller binaries. Marcus frequently contributes to public energy forum discussions under his engineering alias.
                </div>
              </div>
            ) : (
              /* Rendered Forum Thread */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                    <span className="font-semibold text-slate-200">
                      [Lost & Found] Dropped Access Badge near Substation Alpha-9 Turnstile
                    </span>
                    <span className="font-mono text-[11px]">Thread #8921</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                    <p>
                      Hey everyone, quick heads up to the security desk on duty — I seem to have dropped my physical staff access badge (<strong>evidence_badge.png</strong>) right outside the Alpha-9 turnstiles.
                    </p>
                    <p>
                      Security confirmed they picked it up and stored it in the evidence lockbox. Please do not re-encode it, as I need the RFID chip intact for tomorrow morning's perimeter gateway deployment.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-dashed border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                    <div className="text-cyan-400 font-semibold">Marcus Vance | @mv_infra_lead</div>
                    <div className="text-slate-300 text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                      &quot;Verification Token Part 2: f00tpr1nt_d1sc0v3r3d&#125; (Assembly Directive: Part 1 + Part 2)&quot;
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Marcus&apos;s post confirms his lost badge (<code>evidence_badge.png</code>) is preserved for Stage 2 analysis.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Clean Token Assembly Box (No flags leaked) */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Flag Fragment Assembly
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Find the two fragments across the records and combine them here:
            </p>

            <form onSubmit={handleAssemble} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Part 1 (from Profile Markup):
                </label>
                <input
                  type="text"
                  value={fragment1}
                  onChange={(e) => setFragment1(e.target.value)}
                  placeholder="Paste Part 1 here..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Part 2 (from Forum Signature):
                </label>
                <input
                  type="text"
                  value={fragment2}
                  onChange={(e) => setFragment2(e.target.value)}
                  placeholder="Paste Part 2 here..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20"
              >
                Assemble &amp; Verify Token
              </button>
            </form>

            {assembledFlag && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 block">Your Assembled Token:</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-400">
                  <span className="break-all">{assembledFlag}</span>
                  <button
                    onClick={handleCopyFlag}
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0 ml-2"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <Link
                  to="/challenges"
                  className="block text-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline pt-1"
                >
                  Go to Arena to Submit &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Next Stage Teaser */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="text-cyan-400 font-semibold block uppercase tracking-wider text-[10px]">
              Next Step: Stage 2
            </span>
            <p>
              Once you submit this flag, download Marcus&apos;s recovered badge (<code>evidence_badge.png</code>) to uncover his secret C2 transmission key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
