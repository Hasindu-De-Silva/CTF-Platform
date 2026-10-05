#!/usr/bin/env python3
# Reference Solver for Stage 7: The Sabotage Binary

TABLE = [0x1b, 0x22, 0x23, 0x1c, 0x15, 0x86, 0x24, 0x30, 0x2e, 0x29, 0x95, 0x89, 0x8e, 0x8f, 0x96, 0xa4, 0x45, 0x4a, 0x55, 0x56, 0x57]

def solve():
    recovered = []
    for i, val in enumerate(TABLE):
        orig_byte = ((val - (i * 3)) & 0xFF) ^ 0x5A
        recovered.append(chr(orig_byte))
    phrase = "".join(recovered)
    print(f"[+] Recovered Authorization Phrase: {phrase}")
    print(f"[+] Flag: CTF{r3v3rs3_3ng1n33r_m4st3r}")

if __name__ == "__main__":
    solve()
