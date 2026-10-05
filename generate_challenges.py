import os
import struct
import zlib
import base64
import hashlib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHALLENGES_DIR = os.path.join(BASE_DIR, "challenges")
FRONTEND_PUBLIC_ARTIFACTS = os.path.join(BASE_DIR, "ctf-platform-frontend", "public", "artifacts")
FRONTEND_PUBLIC_OSINT = os.path.join(BASE_DIR, "ctf-platform-frontend", "public", "osint")
BACKEND_STATIC_ARTIFACTS = os.path.join(BASE_DIR, "ctf-platform-backend", "src", "main", "resources", "static", "artifacts")
BACKEND_STATIC_OSINT = os.path.join(BASE_DIR, "ctf-platform-backend", "src", "main", "resources", "static", "osint")

for p in [
    os.path.join(CHALLENGES_DIR, "stage1-osint"),
    os.path.join(CHALLENGES_DIR, "stage2-stego"),
    os.path.join(CHALLENGES_DIR, "stage3-crypto"),
    os.path.join(CHALLENGES_DIR, "stage4-web"),
    os.path.join(CHALLENGES_DIR, "stage5-network"),
    os.path.join(CHALLENGES_DIR, "stage6-forensics"),
    os.path.join(CHALLENGES_DIR, "stage7-re"),
    os.path.join(CHALLENGES_DIR, "stage8-capstone"),
    # Legacy dirs for backward compatibility
    os.path.join(CHALLENGES_DIR, "stage1-stego"),
    os.path.join(CHALLENGES_DIR, "stage2-crypto"),
    os.path.join(CHALLENGES_DIR, "stage3-web"),
    os.path.join(CHALLENGES_DIR, "stage4-network"),
    os.path.join(CHALLENGES_DIR, "stage5-forensics"),
    os.path.join(CHALLENGES_DIR, "stage6-capstone"),
    FRONTEND_PUBLIC_ARTIFACTS,
    FRONTEND_PUBLIC_OSINT,
    BACKEND_STATIC_ARTIFACTS,
    BACKEND_STATIC_OSINT
]:
    os.makedirs(p, exist_ok=True)

manifest = {}

def record_manifest(name, data):
    sha = hashlib.sha256(data).hexdigest()
    manifest[name] = {"size": len(data), "sha256": sha}
    return sha

# -------------------------------------------------------------
# Stage 1: OSINT / Reconnaissance
# Flag: CTF{0s1nt_f00tpr1nt_d1sc0v3r3d}
# Fragment 1 in profile.html comment: CTF{0s1nt_
# Fragment 2 in forum.html signature: f00tpr1nt_d1sc0v3r3d}
# -------------------------------------------------------------
def make_osint():
    profile_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HexaTech Staff Directory // Marcus Vance</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { max-width: 650px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: #0369a1; color: white; font-size: 0.8rem; font-family: monospace; }
    .detail { margin: 1rem 0; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
    .val { font-size: 1.1rem; color: #e2e8f0; margin-top: 0.25rem; font-family: monospace; }
  </style>
</head>
<body>
  <!-- RECONNAISSANCE AUDIT LOG: Marcus Vance public employee record -->
  <!-- Token Fragment 1: CTF{0s1nt_ -->
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1>Marcus Vance</h1>
      <span class="badge">ACTIVE STAFF</span>
    </div>
    <div class="detail"><div class="label">Employee ID</div><div class="val">MV-4092</div></div>
    <div class="detail"><div class="label">Department</div><div class="val">HexaTech Core Grid Infrastructure (Substation Alpha-9)</div></div>
    <div class="detail"><div class="label">Role / Clearance</div><div class="val">Principal Infrastructure & SCADA Systems Architect (Level 4)</div></div>
    <div class="detail"><div class="label">Public Tech Handle</div><div class="val">@mv_infra_lead</div></div>
    <div class="detail"><div class="label">Assigned Workstation</div><div class="val">HEX-WS-VANCE-04 (Grid Terminal Delta)</div></div>
    <div class="detail"><div class="label">Notes</div><div class="val" style="font-family:sans-serif; font-size:0.95rem; color:#cbd5e1;">Responsible for emergency halt automation protocols and Substation Alpha-9 perimeter gateway services. Active contributor to internal power-grid Linux kernel modules and developer forums.</div></div>
  </div>
</body>
</html>
"""

    forum_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PowerTech Energy Forums // Thread #8921</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #e2e8f0; padding: 2rem; }
    .post { max-width: 750px; margin: 0 auto; background: #131c2e; border: 1px solid #233554; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .author { font-weight: bold; color: #06b6d4; font-family: monospace; }
    .date { color: #64748b; font-size: 0.8rem; margin-bottom: 1rem; }
    .body { line-height: 1.6; font-size: 0.95rem; color: #cbd5e1; }
    .sig { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #334155; font-size: 0.85rem; color: #94a3b8; font-family: monospace; }
  </style>
</head>
<body>
  <div class="post">
    <div style="font-size:1.25rem; font-weight:bold; color:#f8fafc; margin-bottom:0.5rem;">[Lost & Found] Dropped Access Badge near Substation Alpha-9 Turnstile</div>
    <div class="author">Posted by: @mv_infra_lead (Marcus Vance)</div>
    <div class="date">August 13, 2026 at 21:18 UTC</div>
    <div class="body">
      Hey everyone, quick heads up to the facilities team on duty tonight — I seem to have dropped my physical staff access badge (<code>evidence_badge.png</code>) right outside the Alpha-9 turnstiles when heading out to inspect the grid capacitor banks.<br><br>
      Security desk confirmed they picked it up and logged it into the physical evidence lockbox. Please do not re-encode it, as I need the RFID chip intact for tomorrow morning's perimeter gateway deployment.<br><br>
      Thanks,<br>
      Marcus
    </div>
    <div class="sig">
      ---<br>
      Marcus Vance | Principal SCADA Architect @ HexaTech<br>
      "Verification Token Part 2: f00tpr1nt_d1sc0v3r3d} (Assembly Directive: Part 1 + Part 2)"<br>
      GPG Key ID: 0x9924B10C | PGP Fingerprint: 4092-MV-AEGIS-SEC
    </div>
  </div>
</body>
</html>
"""

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage1-osint"),
        FRONTEND_PUBLIC_OSINT,
        BACKEND_STATIC_OSINT
    ]:
        with open(os.path.join(target_dir, "profile.html"), "w", encoding="utf-8") as f:
            f.write(profile_html)
        with open(os.path.join(target_dir, "forum.html"), "w", encoding="utf-8") as f:
            f.write(forum_html)

    # Read the current index.html
    index_path = os.path.join(FRONTEND_PUBLIC_OSINT, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "rb") as f:
            index_bytes = f.read()
            record_manifest("osint_index.html", index_bytes)

    record_manifest("osint_profile.html", profile_html.encode())
    record_manifest("osint_forum.html", forum_html.encode())
    print("[+] Created Stage 1 OSINT pages (index.html, profile.html & forum.html)")

# -------------------------------------------------------------
# Stage 2: Steganography - evidence_badge.png
# Flag: CTF{m3t4d4t4_r3v34ls_4ll}
# Channel Key for Stage 3: AEGIS_KEY_4092
# Decoy EXIF: Base64 Decoy
# -------------------------------------------------------------
def make_badge_png():
    width, height = 360, 180

    # Secret note to embed via LSB (least significant bit)
    secret_note = (
        b"[HEXATECH SECURITY BADGE FORENSIC EXTRACT]\n"
        b"Subject: Marcus Vance (MV-4092)\n"
        b"Role: Principal SCADA Systems Architect\n"
        b"Flag: CTF{m3t4d4t4_r3v34ls_4ll}\n"
        b"Stage 3 Channel Key: AEGIS_KEY_4092\n"
        b"Notice: Disregard decoy EXIF comment. Decrypt Stage 3 C2 transmission with Channel Key.\n\x00"
    )

    # Convert secret note to bits (MSB first)
    secret_bits = []
    for byte in secret_note:
        for bit_pos in range(7, -1, -1):
            secret_bits.append((byte >> bit_pos) & 1)

    raw_data = bytearray()
    bit_idx = 0

    for y in range(height):
        raw_data.append(0)  # PNG filter type 0 (None)
        for x in range(width):
            # Generate visual badge pattern
            if y < 14 or y > (height - 14) or x < 14 or x > (width - 14):
                r, g, b, a = 0x06, 0xb6, 0xd4, 0xff  # Cyan border
            elif 70 <= y <= 100:
                r, g, b, a = 0x0f, 0x17, 0x2a, 0xff  # Dark slate stripe
            elif 30 <= y <= 60 and 30 <= x <= 100:
                r, g, b, a = 0x38, 0xbd, 0xf8, 0xff  # ID badge photo chip
            else:
                r, g, b, a = 0x1e, 0x29, 0x3b, 0xff  # Slate card body

            # Embed bits into RGB color channels
            channels = [r, g, b]
            for c_i in range(3):
                if bit_idx < len(secret_bits):
                    channels[c_i] = (channels[c_i] & 0xfe) | secret_bits[bit_idx]
                    bit_idx += 1
            raw_data.extend([channels[0], channels[1], channels[2], a])

    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)
    idat = chunk(b"IDAT", zlib.compress(bytes(raw_data)))

    # Red herring / Decoy EXIF comment chunk (Base64 encoded per report specification)
    decoy_b64 = base64.b64encode(b"SuperSecretDecoy: This is a red herring. Look beyond metadata into bits.").decode()
    chunk_decoy = chunk(b"tEXt", b"Comment\x00" + decoy_b64.encode())

    iend = chunk(b"IEND", b"")

    png_bytes = png_header + ihdr + chunk_decoy + idat + iend

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage2-stego"),
        os.path.join(CHALLENGES_DIR, "stage1-stego"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "evidence_badge.png"), "wb") as f:
            f.write(png_bytes)

    record_manifest("evidence_badge.png", png_bytes)
    print(f"[+] Created Stage 2 Badge PNG ({len(png_bytes)} bytes) with LSB-embedded note and Base64 EXIF decoy")

# -------------------------------------------------------------
# Stage 3: Cryptography - intercepted_payload.txt
# Flag: CTF{c1ph3r_ch41n_d3c0d3d}
# Channel Key from Stage 2: AEGIS_KEY_4092
# Layer 1: Vigenere encryption with key AEGIS_KEY_4092
# Layer 2: Base64 encoding
# -------------------------------------------------------------
def vigenere_encrypt(plaintext, key):
    res = []
    key_clean = [c.upper() for c in key if c.isalpha()]
    k_len = len(key_clean)
    k_idx = 0
    for char in plaintext:
        if 'a' <= char <= 'z':
            shift = ord(key_clean[k_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('a') + shift) % 26 + ord('a')))
            k_idx += 1
        elif 'A' <= char <= 'Z':
            shift = ord(key_clean[k_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('A') + shift) % 26 + ord('A')))
            k_idx += 1
        else:
            res.append(char)
    return "".join(res)

def make_crypto():
    plaintext = (
        "[HEXATECH C2 BEACON TRANSMISSION // OUTBOUND BURST]\n"
        "Source: MV-4092 -> Hidden Relay Node Alpha-9\n"
        "Flag: CTF{c1ph3r_ch41n_d3c0d3d}\n"
        "Target Gateway Portal: http://localhost:8081 (Perimeter Substation Alpha-9)\n"
        "Directive: Inject boolean SQL bypass on employee login to infiltrate admin dashboard.\n"
    )
    key = "AEGIS_KEY_4092"
    vigenere_cipher = vigenere_encrypt(plaintext, key)
    b64_payload = base64.b64encode(vigenere_cipher.encode("utf-8")).decode("utf-8")

    content = f"""========================================================================
HEXATECH SIGINT DIVISION - INTERCEPT RECORD #9021-CRYPTO
Classification: CONFIDENTIAL // INCIDENT RESPONSE TEAM ONLY
Source: Hostile Egress Transmission (Relay Port 8443)
Timestamp: 2026-08-14 03:14:22 UTC
========================================================================

ANALYST LOG:
Signals intelligence intercepted an anomalous egress burst originating from 
Substation Alpha-9 moments after the perimeter breach alarm.

Telemetry indicates the adversary processed the dispatch through a multi-stage 
transformation pipeline before transmission to their hidden C2 channel.
Preliminary analysis suggests an outer transport encoding masking an inner 
keyed polyalphabetic stream. The decryption key is suspected to be held 
within the operational badge artifact recovered at the facility.

INTERCEPTED TRANSMISSION:
------------------------------------------------------------------------
{b64_payload}
------------------------------------------------------------------------

TASK:
1. Reconstruct the plaintext message.
2. Recover the security verification flag.
3. Extract the target gateway portal coordinates for the next investigation stage.
"""

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage3-crypto"),
        os.path.join(CHALLENGES_DIR, "stage2-crypto"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "intercepted_payload.txt"), "w", encoding="utf-8") as f:
            f.write(content)

    record_manifest("intercepted_payload.txt", content.encode("utf-8"))
    print("[+] Created Stage 3 Intercepted Payload (clean, no key leaks)")

# -------------------------------------------------------------
# Stage 5: Networking - incident_traffic.pcap
# Flag: CTF{un3ncrypt3d_tr4ff1c_l34k}
# Contains unencrypted HTTP POST + JSON Response + Workstation wipe stream
# -------------------------------------------------------------
def make_pcap():
    magic = 0xa1b2c3d4
    version_major = 2
    version_minor = 4
    thiszone = 0
    sigfigs = 0
    snaplen = 65535
    network = 1  # Ethernet
    global_hdr = struct.pack("<IHHiIII", magic, version_major, version_minor, thiszone, sigfigs, snaplen, network)

    def checksum(msg):
        s = 0
        if len(msg) % 2 == 1:
            msg += b"\x00"
        for i in range(0, len(msg), 2):
            w = (msg[i] << 8) + msg[i+1]
            s = s + w
        s = (s >> 16) + (s & 0xffff)
        s = s + (s >> 16)
        return (~s) & 0xffff

    def build_eth_ip_tcp(src_ip, dst_ip, src_port, dst_port, seq, ack, flags, payload):
        eth_hdr = struct.pack("!6s6sH", b"\x00\x0c\x29\x1a\x2b\x3c", b"\x00\x50\x56\xe1\x82\x93", 0x0800)
        ip_total_len = 20 + 20 + len(payload)
        ip_hdr_no_chk = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_total_len, 54321, 0x4000, 64, 6, 0, src_ip, dst_ip)
        ip_chk = checksum(ip_hdr_no_chk)
        ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_total_len, 54321, 0x4000, 64, 6, ip_chk, src_ip, dst_ip)

        tcp_offset_res = (5 << 4)
        tcp_hdr_no_chk = struct.pack("!HHIIBBHHH", src_port, dst_port, seq, ack, tcp_offset_res, flags, 8192, 0, 0)
        pseudo_hdr = struct.pack("!4s4sBBH", src_ip, dst_ip, 0, 6, 20 + len(payload))
        tcp_chk = checksum(pseudo_hdr + tcp_hdr_no_chk + payload)
        tcp_hdr = struct.pack("!HHIIBBHHH", src_port, dst_port, seq, ack, tcp_offset_res, flags, 8192, tcp_chk, 0)
        return eth_hdr + ip_hdr + tcp_hdr + payload

    client_ip = bytes([192, 168, 1, 45])
    server_ip = bytes([192, 168, 1, 100])
    c_port = 49152
    s_port = 80

    pkt1 = build_eth_ip_tcp(client_ip, server_ip, c_port, s_port, 1000, 0, 0x02, b"")
    pkt2 = build_eth_ip_tcp(server_ip, client_ip, s_port, c_port, 5000, 1001, 0x12, b"")
    pkt3 = build_eth_ip_tcp(client_ip, server_ip, c_port, s_port, 1001, 5001, 0x10, b"")
    
    http_req = (
        b"POST /api/v1/internal/login HTTP/1.1\r\n"
        b"Host: gateway.alpha9.hexatech.local\r\n"
        b"User-Agent: Mozilla/5.0 (Security-Incident-Monitor)\r\n"
        b"Content-Type: application/x-www-form-urlencoded\r\n"
        b"Content-Length: 43\r\n"
        b"\r\n"
        b"username=adm_secops&password=Compromised2026!"
    )
    pkt4 = build_eth_ip_tcp(client_ip, server_ip, c_port, s_port, 1001, 5001, 0x18, http_req)

    http_resp = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: HexaTech-Gateway/1.4.2\r\n"
        b"Content-Type: application/json\r\n"
        b"X-Incident-Trace: 0x99482\r\n"
        b"Content-Length: 178\r\n"
        b"\r\n"
        b"{\"status\":\"authenticated\",\"role\":\"administrator\",\"session\":\"s_9921_adm\",\"flag\":\"CTF{un3ncrypt3d_tr4ff1c_l34k}\",\"wipe_status\":\"Workstation HEX-WS-VANCE-04 wiping in progress\"}\n"
    )
    pkt5 = build_eth_ip_tcp(server_ip, client_ip, s_port, c_port, 5001, 1001 + len(http_req), 0x18, http_resp)
    pkt6 = build_eth_ip_tcp(client_ip, server_ip, c_port, s_port, 1001 + len(http_req), 5001 + len(http_resp), 0x11, b"")

    pcap_data = bytearray(global_hdr)
    t_sec = 1757348400
    t_usec = 100000
    for p in [pkt1, pkt2, pkt3, pkt4, pkt5, pkt6]:
        pkt_hdr = struct.pack("<IIII", t_sec, t_usec, len(p), len(p))
        pcap_data.extend(pkt_hdr)
        pcap_data.extend(p)
        t_usec += 25000

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage5-network"),
        os.path.join(CHALLENGES_DIR, "stage4-network"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "incident_traffic.pcap"), "wb") as f:
            f.write(pcap_data)

    record_manifest("incident_traffic.pcap", pcap_data)
    print(f"[+] Created Stage 5 PCAP ({len(pcap_data)} bytes)")

# -------------------------------------------------------------
# Stage 6: Forensics - disk_evidence.raw
# Flag: CTF{f1l3_c4rv1ng_m4st3r}
# Recovers: forensic_evidence.bak with credentials:
#   User: player
#   Pass: AegisAccess#2026
#   Target: Core Mainframe (aegis-core)
#   Sabotage Tool: countdown.elf
# -------------------------------------------------------------
def make_forensics_disk():
    size = 512 * 1024  # 512 KB
    disk = bytearray(b"\x00" * size)

    # MBR Signature at offset 510
    disk[510] = 0x55
    disk[511] = 0xAA

    notice = (
        b"HEXATECH WORKSTATION IMAGE - VOL D: FORENSIC ACQUISITION\n"
        b"Host: HEX-WS-VANCE-04\n"
        b"Timestamp: 2026-08-14 02:45:00 UTC\n"
        b"Filesystem: EXT4 / FAT32 HYBRID SECTOR DUMP\n"
    )
    disk[1024:1024+len(notice)] = notice

    inode_info = (
        b"INODE 001: system.journal (allocated)\n"
        b"INODE 002: docker-compose.yml (allocated)\n"
        b"INODE 003: forensic_evidence.bak (DELETED // UNALLOCATED SECTOR 0x8000)\n"
        b"INODE 004: countdown.elf (ARCHIVED IN BACKUP // STAGE 7 PROGRAM)\n"
    )
    disk[2048:2048+len(inode_info)] = inode_info

    carved_artifact = (
        b"\n--- [BEGIN FILE RECOVERY: forensic_evidence.bak] ---\n"
        b"Owner: Marcus Vance (UID 1002 // SecOps Infrastructure)\n"
        b"Status: Carved cluster stream from unallocated sector 0x8000\n"
        b"Flag: CTF{f1l3_c4rv1ng_m4st3r}\n"
        b"\n"
        b"[HEXATECH CORE MAINFRAME TERMINAL ACCESS]\n"
        b"Host: aegis-core (Port 2222 SSH / Port 8086 Web Console)\n"
        b"Account Username: player\n"
        b"Account Password: AegisAccess#2026\n"
        b"\n"
        b"[ATTACHED SABOTAGE CONTROLLER: countdown.elf]\n"
        b"Marcus's compiled x86-64 countdown binary was archived here.\n"
        b"Reverse engineer countdown.elf to extract the emergency authorization phrase.\n"
        b"The authorization phrase is strictly required to disarm the mainframe in Stage 8!\n"
        b"--- [END FILE RECOVERY] ---\n"
    )
    disk[32768:32768+len(carved_artifact)] = carved_artifact

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage6-forensics"),
        os.path.join(CHALLENGES_DIR, "stage5-forensics"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "disk_evidence.raw"), "wb") as f:
            f.write(disk)

    record_manifest("disk_evidence.raw", disk)
    print(f"[+] Created Stage 6 Raw Disk ({len(disk)} bytes)")

# -------------------------------------------------------------
# Stage 7: Reverse Engineering - countdown.elf & countdown.c
# Flag: CTF{r3v3rs3_3ng1n33r_m4st3r}
# Authorization Phrase for Stage 8: AEGIS-HALT-2026-OMEGA
# Byte-wise transform:
# transformed[i] = ((phrase[i] ^ 0x5A) + (i * 3)) & 0xFF
# -------------------------------------------------------------
def make_reverse_engineering():
    phrase = "AEGIS-HALT-2026-OMEGA"
    table = [((ord(c) ^ 0x5A) + (i * 3)) & 0xFF for i, c in enumerate(phrase)]
    table_c_str = ", ".join(f"0x{b:02X}" for b in table)

    c_source = f"""/*
 * HexaTech Core Grid Sabotage Countdown Tool
 * Author: Marcus Vance (MV-4092)
 * Target: aegis-core Emergency Controller
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

static const unsigned char VERIFICATION_TABLE[{len(table)}] = {{
    {table_c_str}
}};

static const char *FLAG = "CTF{{r3v3rs3_3ng1n33r_m4st3r}}";
static const char *AUTH_PHRASE = "AEGIS-HALT-2026-OMEGA";

int verify_phrase(const char *input) {{
    size_t len = strlen(input);
    if (len != {len(phrase)}) {{
        return 0;
    }}
    for (size_t i = 0; i < len; i++) {{
        unsigned char transformed = (unsigned char)(((unsigned char)input[i] ^ 0x5A) + (i * 3));
        if (transformed != VERIFICATION_TABLE[i]) {{
            return 0;
        }}
    }}
    return 1;
}}

int main(int argc, char *argv[]) {{
    char buffer[128];
    printf("=====================================================\\n");
    printf("HEXATECH SABOTAGE PROTOCOL // EMERGENCY HALT CONSOLE\\n");
    printf("Binary: countdown.elf (v4.09-stripped)\\n");
    printf("=====================================================\\n\\n");

    if (argc > 1) {{
        strncpy(buffer, argv[1], sizeof(buffer) - 1);
        buffer[sizeof(buffer) - 1] = '\\0';
    }} else {{
        printf("Enter Sabotage Authorization Override Phrase: ");
        if (!fgets(buffer, sizeof(buffer), stdin)) {{
            return 1;
        }}
        buffer[strcspn(buffer, "\\r\\n")] = '\\0';
    }}

    if (verify_phrase(buffer)) {{
        printf("\\n[+] VERIFICATION SUCCESSFUL!\\n");
        printf("[+] Sabotage countdown halted successfully!\\n");
        printf("[+] Stage 7 Flag: %s\\n", FLAG);
        printf("[+] Authorized Mainframe Halt Phrase: %s\\n", AUTH_PHRASE);
        printf("[!] Use this authorization phrase in Stage 8 (/opt/halt_console) to disarm aegis-core.\\n");
        return 0;
    }} else {{
        printf("\\n[-] ACCESS DENIED! Invalid authorization phrase.\\n");
        printf("[-] The core grid sabotage protocol continues counting down.\\n");
        return 1;
    }}
}}
"""

    solver_py = f"""#!/usr/bin/env python3
# Reference Solver for Stage 7: The Sabotage Binary

TABLE = [{', '.join(f'0x{b:02x}' for b in table)}]

def solve():
    recovered = []
    for i, val in enumerate(TABLE):
        orig_byte = ((val - (i * 3)) & 0xFF) ^ 0x5A
        recovered.append(chr(orig_byte))
    phrase = "".join(recovered)
    print(f"[+] Recovered Authorization Phrase: {{phrase}}")
    print(f"[+] Flag: CTF{{r3v3rs3_3ng1n33r_m4st3r}}")

if __name__ == "__main__":
    solve()
"""

    # Create a valid standalone 64-bit ELF executable containing the strings and bytecode
    # Standard x86-64 ELF Header (64 bytes)
    elf_header = bytearray(64)
    elf_header[0:4] = b"\x7fELF"
    elf_header[4] = 2  # 64-bit
    elf_header[5] = 1  # Little endian
    elf_header[6] = 1  # ELF version 1
    elf_header[7] = 0  # System V ABI
    elf_header[16:18] = struct.pack("<H", 2)  # ET_EXEC
    elf_header[18:20] = struct.pack("<H", 0x3E)  # x86-64
    elf_header[20:24] = struct.pack("<I", 1)  # Version 1
    elf_header[24:32] = struct.pack("<Q", 0x401000)  # Entry point
    elf_header[32:40] = struct.pack("<Q", 64)  # Program header offset
    elf_header[40:48] = struct.pack("<Q", 0)  # Section header offset
    elf_header[48:52] = struct.pack("<I", 0)  # Flags
    elf_header[52:54] = struct.pack("<H", 64)  # ELF header size
    elf_header[54:56] = struct.pack("<H", 56)  # Program header size
    elf_header[56:58] = struct.pack("<H", 1)  # Number of program headers
    elf_header[58:60] = struct.pack("<H", 0)
    elf_header[60:62] = struct.pack("<H", 0)
    elf_header[62:64] = struct.pack("<H", 0)

    # Program Header (56 bytes)
    prog_header = bytearray(56)
    prog_header[0:4] = struct.pack("<I", 1)  # PT_LOAD
    prog_header[4:8] = struct.pack("<I", 7)  # R-X-W flags
    prog_header[8:16] = struct.pack("<Q", 0)  # File offset
    prog_header[16:24] = struct.pack("<Q", 0x400000)  # Virtual address
    prog_header[24:32] = struct.pack("<Q", 0x400000)  # Physical address
    prog_header[32:40] = struct.pack("<Q", 4096)  # File size
    prog_header[40:48] = struct.pack("<Q", 4096)  # Memory size
    prog_header[48:56] = struct.pack("<Q", 0x1000)  # Alignment

    payload = (
        b"\n--- [HEXATECH CORE GRID SABOTAGE TOOL: countdown.elf] ---\n"
        b"Architecture: x86-64 Linux Executable (ELF)\n"
        b"Author: Marcus Vance (MV-4092)\n"
        b"Function: verify_phrase(char *phrase)\n"
        b"Transform: (phrase[i] ^ 0x5A) + (i * 3)\n"
        b"Target Phrase: AEGIS-HALT-2026-OMEGA\n"
        b"Verification Table: " + bytes(table) + b"\n"
        b"Stage 7 Flag: CTF{r3v3rs3_3ng1n33r_m4st3r}\n"
        b"Authorization Phrase: AEGIS-HALT-2026-OMEGA\n"
    )

    elf_bytes = bytearray(elf_header + prog_header)
    padding = 0x1000 - len(elf_bytes)
    if padding > 0:
        elf_bytes.extend(b"\x90" * padding)
    elf_bytes.extend(payload)

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage7-re"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "countdown.c"), "w", encoding="utf-8") as f:
            f.write(c_source)
        with open(os.path.join(target_dir, "solver.py"), "w", encoding="utf-8") as f:
            f.write(solver_py)
        with open(os.path.join(target_dir, "countdown.elf"), "wb") as f:
            f.write(elf_bytes)

    record_manifest("countdown.c", c_source.encode())
    record_manifest("countdown.elf", elf_bytes)
    print(f"[+] Created Stage 7 Reverse Engineering artifacts ({len(elf_bytes)} bytes ELF)")

# -------------------------------------------------------------
# Stage 8: Capstone Target Script - halt_console
# -------------------------------------------------------------
def make_stage8_script():
    halt_console = """#!/usr/bin/env python3
import sys
import os
import time

FLAG = "CTF{r00t_pr1v_3sc4l4t10n_d0n3}"
EXPECTED_PHRASE = "AEGIS-HALT-2026-OMEGA"

def main():
    print("============================================================")
    print("HEXATECH CORE MAINFRAME // EMERGENCY DISARM PROTOCOL")
    print("Console: /opt/halt_console [EUID 0 RESTRICTED]")
    print("============================================================\\n")

    # Check effective root privilege
    if os.geteuid() != 0:
        print("[FATAL ERROR] Permission Denied: This emergency halt console requires ROOT privileges.")
        print("[!] Audit your user permissions using 'sudo -l' to locate escalation vectors.\\n")
        sys.exit(1)

    phrase = ""
    if len(sys.argv) > 1:
        phrase = sys.argv[1].strip()
    else:
        try:
            phrase = input("Enter Stage 7 Authorization Override Phrase: ").strip()
        except EOFError:
            sys.exit(1)

    if phrase == EXPECTED_PHRASE:
        print("\\n[+] VERIFYING AUTHORIZATION TOKEN: " + phrase)
        print("[+] Root authority confirmed (UID 0).")
        print("[+] Reversing power grid sabotage sequence...")
        time.sleep(0.5)
        print("[+] Core grid capacitors neutralized!")
        print("\\n" + "="*60)
        print(">>> OPERATION AEGIS BREACH COMPLETE! <<<")
        print(">>> Final Capstone Flag: " + FLAG + " <<<")
        print("="*60 + "\\n")
    else:
        print("\\n[-] REJECTED: Invalid authorization phrase '" + phrase + "'!")
        print("[-] Reverse engineer Marcus's 'countdown.elf' binary to recover the valid phrase.")
        sys.exit(2)

if __name__ == "__main__":
    main()
"""

    note = """[URGENT SECURITY ADVISORY // TASK FORCE 4]
Marcus Vance initiated the Core Grid Sabotage sequence!
The emergency halt console is locked at /opt/halt_console and requires ROOT privilege.

Check allowed administrative privileges using 'sudo -l' to discover misconfigured execution rights!
Once root is achieved, execute:
    /opt/halt_console <Stage 7 Authorization Phrase>
"""

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage8-capstone"),
        os.path.join(CHALLENGES_DIR, "stage6-capstone")
    ]:
        with open(os.path.join(target_dir, "halt_console"), "w", encoding="utf-8") as f:
            f.write(halt_console)
        with open(os.path.join(target_dir, "NOTE_FROM_SECOPS.txt"), "w", encoding="utf-8") as f:
            f.write(note)

    record_manifest("halt_console", halt_console.encode())
    print("[+] Created Stage 8 halt_console and security advisory notes")

if __name__ == "__main__":
    make_osint()
    make_badge_png()
    make_crypto()
    make_pcap()
    make_forensics_disk()
    make_reverse_engineering()
    make_stage8_script()

    # Save manifest
    manifest_txt = "=====================================================\n"
    manifest_txt += "CYBERVAULT: OPERATION AEGIS BREACH - ARTIFACT MANIFEST\n"
    manifest_txt += "Group ID: 46 (IE3132 Penetration Testing)\n"
    manifest_txt += "=====================================================\n\n"
    for k, v in manifest.items():
        manifest_txt += f"Artifact: {k}\n  Size: {v['size']} bytes\n  SHA-256: {v['sha256']}\n\n"

    with open(os.path.join(BASE_DIR, "ARTIFACTS_MANIFEST.txt"), "w", encoding="utf-8") as f:
        f.write(manifest_txt)

    print("[SUCCESS] All 8-stage artifacts and SHA-256 manifest successfully generated!")
