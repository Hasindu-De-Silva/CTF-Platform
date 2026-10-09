import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ArrowLeft, Copy, Check, Server, ExternalLink, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stage8TerminalView: React.FC = () => {
  const [history, setHistory] = useState<Array<{ cmd?: string; output: string; isRoot?: boolean }>>([
    {
      output: `Linux aegis-core 6.8.0-generic #1 SMP x86_64
The programs included with the Ubuntu system are free software.

======================================================================
HEXATECH CORE MAINFRAME [AEGIS-CORE] // SYSTEM CONSOLE
Connected as: player (Session ID: SSH-9942 // Substation Alpha-9)
Host: aegis-core • User: player (UID 1000)
Type 'help' or 'cat NOTE_FROM_SECOPS.txt' for mission advisory.
======================================================================
`
    }
  ]);
  const [input, setInput] = useState('');
  const [isRoot, setIsRoot] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const flag = "CTF{r00t_pr1v_3sc4l4t10n_d0n3}";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleResetTerminal = () => {
    setIsRoot(false);
    setShowCelebration(false);
    setInput('');
    setHistory([
      {
        output: `Linux aegis-core 6.8.0-generic #1 SMP x86_64
The programs included with the Ubuntu system are free software.

======================================================================
HEXATECH CORE MAINFRAME [AEGIS-CORE] // SYSTEM CONSOLE
Connected as: player (Session ID: SSH-9942 // Substation Alpha-9)
Host: aegis-core • User: player (UID 1000)
Type 'help' or 'cat NOTE_FROM_SECOPS.txt' for mission advisory.
======================================================================
`
      }
    ]);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setInput('');
    const currentIsRoot = isRoot;

    let output = '';
    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setHistory([]);
      return;
    } else if (lower === 'help') {
      output = `Available system commands:
  id                                    - Print real and effective user/group IDs
  whoami                                - Print current effective username
  ls / ls -la                           - List directory contents and permissions
  cat <file>                            - Concatenate and display file content
  sudo -l                               - List allowed commands for invoking user
  clear                                 - Clear terminal screen`;
    } else if (lower === 'id') {
      output = currentIsRoot
        ? 'uid=0(root) gid=0(root) groups=0(root)'
        : 'uid=1000(player) gid=1000(player) groups=1000(player)';
    } else if (lower === 'whoami') {
      output = currentIsRoot ? 'root' : 'player';
    } else if (lower === 'ls' || lower === 'ls -la' || lower === 'ls -l') {
      output = currentIsRoot
        ? `total 32
drwx------ 4 root root 4096 Aug 14 02:40 .
drwxr-xr-x 1 root root 4096 Aug 14 01:00 ..
-rwxr-xr-x 1 root root 1714 Aug 14 02:35 /opt/halt_console
-rw------- 1 root root   33 Aug 14 02:40 flag.txt
-rw-r--r-- 1 root root  220 Jan  6  2022 .bashrc
-rw-r--r-- 1 root root  807 Jan  6  2022 .profile`
        : `total 24
drwxr-xr-x 2 player player 4096 Aug 14 02:40 .
drwxr-xr-x 3 root   root   4096 Aug 14 01:00 ..
-rw-r--r-- 1 player player  379 Aug 14 02:41 NOTE_FROM_SECOPS.txt
-rw-r--r-- 1 player player  220 Jan  6  2022 .bashrc
-rw-r--r-- 1 player player  807 Jan  6  2022 .profile`;
    } else if (lower.startsWith('cat note') || lower === 'cat note_from_secops.txt') {
      output = `[URGENT SECURITY ADVISORY // TASK FORCE 4]
Marcus Vance initiated the Core Grid Sabotage sequence!
The emergency halt console is locked at /opt/halt_console and requires ROOT privilege.

Check allowed administrative privileges using 'sudo -l' to discover misconfigured execution rights!
Once root is achieved, execute:
    /opt/halt_console <Stage 7 Authorization Phrase>`;
    } else if (lower === 'cat /root/flag.txt' || lower === 'cat flag.txt') {
      if (currentIsRoot) {
        output = `${flag}\n\n[SUCCESS] Root flag read directly! You may also execute /opt/halt_console with the Stage 7 phrase to halt the sabotage sequence!`;
        setShowCelebration(true);
      } else {
        output = 'cat: /root/flag.txt: Permission denied';
      }
    } else if (lower === 'sudo -l' || lower === 'sudo -list') {
      output = `Matching Defaults entries for player on aegis-core:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User player may run the following commands on aegis-core:
    (root) NOPASSWD: /usr/bin/find`;
    } else if (
      lower.startsWith('sudo find') ||
      lower.startsWith('sudo /usr/bin/find')
    ) {
      if (lower.includes('-exec') && (lower.includes('sh') || lower.includes('bash'))) {
        setIsRoot(true);
        output = `Spawning elevated root subshell via /usr/bin/find...
[+] Privilege Escalation Successful! Effective UID: 0 (root).
[!] Administrative access established. Run /opt/halt_console with the Stage 7 authorization phrase to disarm the sabotage protocol.`;
      } else if (lower.includes('-exec') && lower.includes('/opt/halt_console')) {
        // Direct execution via sudo find -exec /opt/halt_console ...
        if (lower.includes('aegis-halt-2026-omega')) {
          output = `============================================================
HEXATECH CORE MAINFRAME // EMERGENCY DISARM PROTOCOL
Console: /opt/halt_console [EUID 0 RESTRICTED]
============================================================

[+] VERIFYING AUTHORIZATION TOKEN: AEGIS-HALT-2026-OMEGA
[+] Root authority confirmed (UID 0).
[+] Reversing power grid sabotage sequence...
[+] Core grid capacitors neutralized!

============================================================
>>> OPERATION AEGIS BREACH COMPLETE! <<<
>>> Final Capstone Flag: ${flag} <<<
============================================================`;
          setShowCelebration(true);
        } else {
          output = `[-] REJECTED: Invalid or missing authorization phrase!
[-] Usage: /opt/halt_console <Stage 7 Authorization Phrase>
[-] Reverse engineer Marcus's 'countdown.elf' binary (Stage 7) to recover the valid phrase.`;
        }
      } else {
        output = `find: missing argument to '-exec' or standard find usage. Refer to GTFOBins for find privilege escalation syntax.`;
      }
    } else if (lower.startsWith('/opt/halt_console') || lower.startsWith('python3 /opt/halt_console')) {
      if (!currentIsRoot) {
        output = `============================================================
HEXATECH CORE MAINFRAME // EMERGENCY DISARM PROTOCOL
Console: /opt/halt_console [EUID 0 RESTRICTED]
============================================================

[FATAL ERROR] Permission Denied: This emergency halt console requires ROOT privileges.
[!] Audit your user permissions using 'sudo -l' to locate escalation vectors.`;
      } else if (lower.includes('aegis-halt-2026-omega')) {
        output = `============================================================
HEXATECH CORE MAINFRAME // EMERGENCY DISARM PROTOCOL
Console: /opt/halt_console [EUID 0 RESTRICTED]
============================================================

[+] VERIFYING AUTHORIZATION TOKEN: AEGIS-HALT-2026-OMEGA
[+] Root authority confirmed (UID 0).
[+] Reversing power grid sabotage sequence...
[+] Core grid capacitors neutralized!

============================================================
>>> OPERATION AEGIS BREACH COMPLETE! <<<
>>> Final Capstone Flag: ${flag} <<<
============================================================`;
        setShowCelebration(true);
      } else {
        output = `[-] REJECTED: Invalid or missing authorization phrase!
[-] Usage: /opt/halt_console <Stage 7 Authorization Phrase>
[-] Reverse engineer Marcus's 'countdown.elf' binary (Stage 7) to recover the valid phrase.`;
      }
    } else {
      output = `${cmd}: command not found. Type 'help' or 'cat NOTE_FROM_SECOPS.txt'.`;
    }

    setHistory((prev) => [
      ...prev,
      { cmd, output, isRoot: currentIsRoot }
    ]);
  };

  const handleCopyFlag = () => {
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-8">
      {/* Navigation Header */}
      <div className="w-full max-w-5xl mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Arena
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold uppercase">
              Stage 08 // Capstone Takeover
            </span>
            <span className="text-xs text-slate-500 font-mono">NODE 08</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            HexaTech Core Mainframe Terminal: aegis-core
          </h1>
        </div>

        {/* External Access Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>SSH: <code>localhost:2222</code> (user: <code>player</code>)</span>
          </div>
          <a
            href="http://localhost:8086"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Standalone Console (8086)
          </a>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[680px]">
        {/* Terminal Header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="ml-3 flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>aegis-core (HexaTech Core Mainframe)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRoot ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {isRoot ? 'ROOT ACCESS (UID 0)' : 'USER: player (UID 1000)'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            SESSION: SSH-PLAYER
          </span>
        </div>

        {/* Terminal Screen Output */}
        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-emerald-400 space-y-3 bg-black/90">
          {history.map((h, i) => (
            <div key={i} className="space-y-1">
              {h.cmd && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span className={h.isRoot ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                    {h.isRoot ? 'root@aegis-core:~#' : 'player@aegis-core:~$'}
                  </span>
                  <span>{h.cmd}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-emerald-400 leading-relaxed">
                {h.output}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Input Form */}
        <form onSubmit={handleCommand} className="bg-slate-950 p-3 border-t border-slate-800 flex items-center gap-2">
          <span className={`font-mono text-xs font-bold shrink-0 ${isRoot ? 'text-rose-400' : 'text-cyan-400'}`}>
            {isRoot ? 'root@aegis-core:~#' : 'player@aegis-core:~$'}
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRoot ? "Execute /opt/halt_console with authorization phrase..." : "Type command (e.g. id, sudo -l, cat NOTE_FROM_SECOPS.txt)..."}
            className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder-slate-600"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold transition-colors"
          >
            Execute
          </button>
        </form>

        {/* Footer Command Shortcuts (Zero Spoilers) */}
        <div className="bg-slate-900/80 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Enumeration Shortcuts:</span>
            <button
              type="button"
              onClick={() => setInput('id')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
            >
              id
            </button>
            <button
              type="button"
              onClick={() => setInput('whoami')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
            >
              whoami
            </button>
            <button
              type="button"
              onClick={() => setInput('ls -la')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
            >
              ls -la
            </button>
            <button
              type="button"
              onClick={() => setInput('cat NOTE_FROM_SECOPS.txt')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
            >
              cat NOTE
            </button>
            <button
              type="button"
              onClick={() => setInput('sudo -l')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
            >
              sudo -l
            </button>
            <button
              type="button"
              onClick={() => { setHistory([]); setInput(''); }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              clear
            </button>
            <button
              type="button"
              onClick={handleResetTerminal}
              title="Reset terminal session to initial unprivileged player state"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>reset session</span>
            </button>
          </div>

          {showCelebration && (
            <button
              onClick={handleCopyFlag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Final Flag'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
