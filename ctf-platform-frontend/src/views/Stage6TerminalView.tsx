import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Stage6TerminalView: React.FC = () => {
  const [history, setHistory] = useState<Array<{ cmd?: string; output: string; isRoot?: boolean }>>([
    {
      output: `Linux aegis-core 5.15.0-generic #1 SMP x86_64
The programs included with the Ubuntu system are free software.

======================================================================
HEXATECH CORE MAINFRAME [AEGIS-CORE] // SYSTEM CONSOLE
Connected as: player (Session ID: SSH-9942)
Type 'help' for available system commands.
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
      output = `Available enumeration commands:
  id          - Display user identity and group memberships
  whoami      - Print current effective username
  ls / ls -la - List directory files and permissions
  cat <file>  - Read content of a file
  sudo -l     - List allowed (and forbidden) commands for invoking user
  clear       - Clear terminal screen`;
    } else if (lower === 'id') {
      output = currentIsRoot
        ? 'uid=0(root) gid=0(root) groups=0(root)'
        : 'uid=1000(player) gid=1000(player) groups=1000(player)';
    } else if (lower === 'whoami') {
      output = currentIsRoot ? 'root' : 'player';
    } else if (lower === 'ls' || lower === 'ls -la' || lower === 'ls -l') {
      output = currentIsRoot
        ? `total 28
drwx------ 4 root root 4096 Sep 10 01:20 .
drwxr-xr-x 1 root root 4096 Sep 10 01:00 ..
-rw------- 1 root root   33 Sep 10 01:22 flag.txt
-rw-r--r-- 1 root root  220 Jan  6  2022 .bashrc
-rw-r--r-- 1 root root  807 Jan  6  2022 .profile`
        : `total 24
drwxr-xr-x 2 player player 4096 Sep 10 01:20 .
drwxr-xr-x 3 root   root   4096 Sep 10 01:00 ..
-rw-r--r-- 1 player player  214 Sep 10 01:21 NOTE_FROM_SECOPS.txt
-rw-r--r-- 1 player player  220 Jan  6  2022 .bashrc
-rw-r--r-- 1 player player  807 Jan  6  2022 .profile`;
    } else if (lower.startsWith('cat note') || lower === 'cat note_from_secops.txt') {
      output = `[URGENT SECURITY ADVISORY // TASK FORCE 4]
Marcus Vance initiated the Core Grid Sabotage sequence!
The emergency halt key is stored in /root/flag.txt (chmod 0600 - root read only).
Check allowed administrative privileges using 'sudo -l' to discover misconfigured execution rights!`;
    } else if (lower === 'cat /root/flag.txt' || lower === 'cat flag.txt') {
      if (currentIsRoot) {
        output = `${flag}\n\n[SUCCESS] Sabotage sequence halted! Marcus Vance's persistence vector neutralized!`;
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
      lower.includes('sudo find') ||
      lower.includes('sudo /usr/bin/find')
    ) {
      if (lower.includes('-exec') || lower.includes('sh') || lower.includes('bash')) {
        setIsRoot(true);
        output = `Spawning elevated root subshell via GTFOBins /usr/bin/find...
[+] Privilege Escalation Successful! Effective UID: 0 (root).
Type 'cat /root/flag.txt' to retrieve the final capstone flag.`;
      } else {
        output = `find: missing argument to '-exec'
Hint: Check GTFOBins for 'find' sudo privilege escalation syntax:
  sudo find . -exec /bin/sh \\; -quit`;
      }
    } else if (lower === 'exit') {
      if (currentIsRoot) {
        setIsRoot(false);
        output = 'Exited root shell. Dropped back to player privileges.';
      } else {
        output = 'Session cannot be closed: Core terminal required for incident mitigation.';
      }
    } else {
      output = `bash: ${cmd}: command not found. Type 'help' for guidance.`;
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
    <div className="min-h-screen bg-black text-emerald-400 p-4 sm:p-6 font-mono flex flex-col items-center justify-center">
      {/* Navigation Top Bar */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <Link
          to="/challenges"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Arena
        </Link>
        <span className="text-xs text-slate-500">
          NODE 06 // LINUX CAPSTONE TERMINAL
        </span>
      </div>

      {/* Terminal Window Box */}
      <div className="w-full max-w-4xl bg-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] shadow-emerald-500/10">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-xs text-slate-400 font-semibold ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              {isRoot ? 'root@aegis-core:~#' : 'player@aegis-core:~$'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Privileges: {isRoot ? <strong className="text-rose-400">ROOT (UID 0)</strong> : 'UNPRIVILEGED (player)'}</span>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs sm:text-sm leading-relaxed">
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
              <div className="text-emerald-300/90 whitespace-pre-wrap">{h.output}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Flag Solved Banner (Appears when flag revealed) */}
        {showCelebration && (
          <div className="bg-emerald-950/80 border-t border-emerald-500/40 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-300 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Final Capstone Flag Recovered: <strong>{flag}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyFlag}
                className="px-3 py-1 bg-emerald-500 text-black font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-400 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Flag'}</span>
              </button>
              <Link
                to="/challenges"
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-all"
              >
                Submit in Arena &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleCommand}
          className="bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-2"
        >
          <span className={`text-xs font-bold ${isRoot ? 'text-rose-400' : 'text-cyan-400'}`}>
            {isRoot ? 'root@aegis-core:~#' : 'player@aegis-core:~$'}
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRoot
                ? "Try 'cat /root/flag.txt'..."
                : "Try 'sudo -l', 'ls -la', 'cat NOTE_FROM_SECOPS.txt', or GTFOBins find..."
            }
            autoFocus
            className="flex-1 bg-transparent text-emerald-200 text-xs sm:text-sm outline-none placeholder-slate-600 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700 font-mono"
          >
            Execute
          </button>
        </form>
      </div>
    </div>
  );
};
