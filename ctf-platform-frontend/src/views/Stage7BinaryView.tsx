import React, { useState } from 'react';
import { Terminal, Code, Cpu, Download, ArrowLeft, Check, Copy, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const VERIFICATION_TABLE = [
  0x3F, 0x3E, 0x39, 0x30, 0x48, 0x35, 0x50, 0x54, 0x5E, 0x67, 
  0x3B, 0x41, 0x41, 0x4A, 0x34, 0x60, 0x5F, 0x58, 0x59, 0x76, 
  0x78
];

export const Stage7BinaryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tester' | 'decompile' | 'strings'>('tester');
  const [testPhrase, setTestPhrase] = useState('AEGIS-HALT-2026-OMEGA');
  const [copied, setCopied] = useState(false);
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  const flag = "CTF{r3v3rs3_3ng1n33r_m4st3r}";
  const authPhrase = "AEGIS-HALT-2026-OMEGA";

  // Compute live transform
  const charResults = testPhrase.split('').map((char, i) => {
    const origCode = char.charCodeAt(0);
    const transformed = ((origCode ^ 0x5a) + (i * 3)) & 0xff;
    const target = i < VERIFICATION_TABLE.length ? VERIFICATION_TABLE[i] : null;
    const isMatch = target !== null && transformed === target;
    return {
      index: i,
      char,
      origCode,
      transformed,
      target,
      isMatch
    };
  });

  const isLengthMatch = testPhrase.length === VERIFICATION_TABLE.length;
  const isFullySolved = isLengthMatch && charResults.every(r => r.isMatch);

  const handleCopyFlag = () => {
    navigator.clipboard.writeText(flag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(authPhrase);
    setCopiedPhrase(true);
    setTimeout(() => setCopiedPhrase(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-8">
      {/* Header Bar */}
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
              Stage 07 // Reverse Engineering
            </span>
            <span className="text-xs text-slate-500 font-mono">NODE 07</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Marcus's Sabotage Binary Workbench: countdown.elf
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Architecture: x86-64 ELF Linux Executable • Stripped Symbol Table
          </p>
        </div>

        {/* Action & Tab Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/artifacts/countdown.elf"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Download countdown.elf
          </a>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('tester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tester'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Transform Simulator
            </button>
            <button
              onClick={() => setActiveTab('decompile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'decompile'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Ghidra Decompilation
            </button>
            <button
              onClick={() => setActiveTab('strings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'strings'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Strings & Hex
            </button>
          </div>
        </div>
      </div>

      {/* Main Workbench Display */}
      <div className="w-full max-w-5xl space-y-6">
        {activeTab === 'tester' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Interactive Transform Loop Tester */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">
                    Byte-wise Validation Loop Simulator
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Formula: ((byte ⊕ 0x5A) + (index × 3)) & 0xFF
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Test Authorization Override Phrase (Expected: 21 ASCII Characters)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPhrase}
                    onChange={(e) => setTestPhrase(e.target.value)}
                    placeholder="Enter candidate phrase..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm tracking-wider focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => setTestPhrase('AEGIS-HALT-2026-OMEGA')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  >
                    Solve Phrase
                  </button>
                </div>
              </div>

              {/* Dynamic Byte Transformation Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Transformation Calculation (Index 0..20):</span>
                  <span>{charResults.filter(r => r.isMatch).length} / 21 Bytes Matched</span>
                </div>

                <div className="overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800 pb-2">
                        <th className="py-1 px-2">Idx</th>
                        <th className="py-1 px-2">Char</th>
                        <th className="py-1 px-2">ASCII</th>
                        <th className="py-1 px-2">⊕ 0x5A</th>
                        <th className="py-1 px-2">+ (i*3)</th>
                        <th className="py-1 px-2">Target</th>
                        <th className="py-1 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {charResults.map((r) => (
                        <tr key={r.index} className={r.isMatch ? 'bg-emerald-950/20' : 'bg-rose-950/20'}>
                          <td className="py-1.5 px-2 text-slate-400">[{r.index}]</td>
                          <td className="py-1.5 px-2 font-bold text-white">'{r.char}'</td>
                          <td className="py-1.5 px-2 text-slate-400">0x{r.origCode.toString(16).toUpperCase()}</td>
                          <td className="py-1.5 px-2 text-slate-400">0x{(r.origCode ^ 0x5a).toString(16).toUpperCase()}</td>
                          <td className="py-1.5 px-2 font-semibold text-cyan-300">0x{r.transformed.toString(16).toUpperCase()}</td>
                          <td className="py-1.5 px-2 text-amber-300">
                            {r.target !== null ? `0x${r.target.toString(16).toUpperCase()}` : 'OVERFLOW'}
                          </td>
                          <td className="py-1.5 px-2">
                            {r.isMatch ? (
                              <span className="text-emerald-400 font-bold">MATCH</span>
                            ) : (
                              <span className="text-rose-400 font-bold">FAIL</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Solved Output Container */}
              {isFullySolved ? (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>Countdown Terminated! Reverse Engineering Flag Captured!</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between font-mono text-xs text-emerald-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Stage 7 Flag:</span>
                      <span className="font-bold text-sm">{flag}</span>
                    </div>
                    <button
                      onClick={handleCopyFlag}
                      className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between font-mono text-xs text-amber-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Stage 8 Mainframe Authorization Phrase:</span>
                      <span className="font-bold text-sm text-amber-400">{authPhrase}</span>
                    </div>
                    <button
                      onClick={handleCopyPhrase}
                      className="p-2 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      {copiedPhrase ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Phrase must be exactly 21 characters and satisfy all table transformations. Type or click 'Solve Phrase' to test.
                  </span>
                </div>
              )}
            </div>

            {/* Right Col: Mathematical Explanation & Next Stage Lead */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Cryptographic Reversal
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The verification function in <code>countdown.elf</code> transforms each input character via:
                </p>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800">
                  table[i] = ((char ⊕ 0x5A) + (i * 3)) & 0xFF
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To reverse the table and recover the original plaintext character:
                </p>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800">
                  char = ((table[i] - (i * 3)) & 0xFF) ⊕ 0x5A
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] block">
                  Next Step: Stage 8 Capstone
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Preserve the recovered authorization phrase <code>AEGIS-HALT-2026-OMEGA</code>. In Stage 8, you will escalate to root on the core mainframe and invoke <code>/opt/halt_console</code> with this phrase to neutralize the sabotage protocol!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'decompile' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">
                  Ghidra / IDA Pro C Pseudocode: verify_phrase()
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">countdown.c (Extracted Logic)</span>
            </div>

            <pre className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto">
{`// =========================================================================
// Decompiled C pseudocode extracted from countdown.elf (stripped x86-64)
// Subroutine: verify_phrase(const char *input_buffer)
// =========================================================================

static const unsigned char VERIFICATION_TABLE[21] = {
    0x3F, 0x3E, 0x39, 0x30, 0x48, 0x35, 0x50, 0x54, 0x5E, 0x67,
    0x3B, 0x41, 0x41, 0x4A, 0x34, 0x60, 0x5F, 0x58, 0x59, 0x76,
    0x78
};

int verify_phrase(const char *input) {
    size_t len = strlen(input);
    if (len != 21) {
        return 0; // Length check failed
    }

    for (size_t i = 0; i < len; i++) {
        // Byte-wise XOR 0x5A followed by index multiplication
        unsigned char transformed = (unsigned char)(((unsigned char)input[i] ^ 0x5A) + (i * 3));
        if (transformed != VERIFICATION_TABLE[i]) {
            return 0; // Mismatch on byte index
        }
    }

    // Success: input string matches the required sabotage authorization token
    return 1;
}

int main(int argc, char *argv[]) {
    // Reads phrase, validates with verify_phrase()
    // If valid: prints CTF{r3v3rs3_3ng1n33r_m4st3r}
    // And provides authorization phrase: AEGIS-HALT-2026-OMEGA
}`}
            </pre>
          </div>
        )}

        {activeTab === 'strings' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400">strings -a countdown.elf | grep -E "(HEXATECH|Flag|Authorization)"</span>
              <span className="text-cyan-400">ELF Header: x86-64 LSB</span>
            </div>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`/lib64/ld-linux-x86-64.so.2
libc.so.6
printf
fgets
strlen
__libc_start_main
HEXATECH SABOTAGE PROTOCOL // EMERGENCY HALT CONSOLE
Binary: countdown.elf (v4.09-stripped)
Enter Sabotage Authorization Override Phrase:
[+] VERIFICATION SUCCESSFUL!
[+] Sabotage countdown halted successfully!
[+] Stage 7 Flag: CTF{r3v3rs3_3ng1n33r_m4st3r}
[+] Authorized Mainframe Halt Phrase: AEGIS-HALT-2026-OMEGA
[-] ACCESS DENIED! Invalid authorization phrase.`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
